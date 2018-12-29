import * as admin from 'firebase-admin';

import { DB, TRANSACTION, PORTFOLIO, STOCK } from '../firebase-constants';
import { TransactionWithUid, Transaction, TransactionExecuted, TransactionStatus, TransactionType } from '../models';
import { getData, getDataArray, getAll } from '../utils';

async function getTransactionsForPortfolio(portfolioId: string): Promise<TransactionWithUid[]> {
  const query = await admin.firestore()
    .collection(DB.TRANSACTIONS)
    .where(TRANSACTION.PORTFOLIO_ID, '==', portfolioId)
    .get()

  if(query.empty) {
    return [];
  }

  const transfers = await getAll(query.docs.map(d => d.ref)); 

  return getDataArray<TransactionWithUid>(transfers);
}

async function createTransactionForPortfolio(portfolioId: string, transaction: Transaction): Promise<TransactionWithUid> {
  if(transaction.type === TransactionType.BUY) {
    return createBuyTransactionForPortfolio(portfolioId, transaction);
  } else if (transaction.type === TransactionType.SELL) {
    return createSellTransactionForPortfolio(portfolioId, transaction);
  } else {
    throw new Error("Transaction type is incorrect.");
  }
}

async function createBuyTransactionForPortfolio(portfolioId: string, transaction: Transaction): Promise<TransactionWithUid> {
  const transactionId = await admin.firestore().runTransaction(async (tx) => {
    const portfolioDoc = await tx.get(admin.firestore().collection(DB.PORTFOLIOS).doc(portfolioId));

    const balance: number = portfolioDoc.get(PORTFOLIO.BALANCE);
    const transactionPrice = transaction.amount * transaction.price;
    const newBalance = balance - transactionPrice;

    if (newBalance < 0) {
      throw new Error("Portfolio balance is too low.");
    }

    const transactionDoc = await tx.get(admin.firestore().collection(DB.TRANSACTIONS).doc());

    const transactionExecuted: TransactionExecuted = {
      ...transaction,
      portfolioId,
      status: TransactionStatus.MARKET
    };

    await tx.set(transactionDoc.ref, transactionExecuted);
    await tx.set(portfolioDoc.ref, { balance: newBalance}, {mergeFields: [PORTFOLIO.BALANCE] });

    return transactionDoc.id;
  });

  const createdTransaction = await admin.firestore().collection(DB.TRANSACTIONS).doc(transactionId).get();

  return getData<TransactionWithUid>(createdTransaction);
}

async function createSellTransactionForPortfolio(portfolioId: string, transaction: Transaction): Promise<TransactionWithUid> {
  const transactionId = await admin.firestore().runTransaction(async (tx) => {
    const symbol = transaction.symbol;
    const portfolioDoc = await tx.get(admin.firestore().collection(DB.PORTFOLIOS).doc(portfolioId));
    const stockDoc = await tx.get(portfolioDoc.ref.collection(PORTFOLIO.STOCKS).doc(symbol));
    
    if (!stockDoc.exists) {
      throw new Error("Cannot sell a stock that is not in portfolio.");
    }

    const stockAmount: number = await stockDoc.get(STOCK.AMOUNT) || 0;

    if (stockAmount < transaction.amount) {
      throw new Error("Not enough stocks to sell.");
    }
    
    const transactionDoc = await tx.get(admin.firestore().collection(DB.TRANSACTIONS).doc());

    const transactionExecuted: TransactionExecuted = {
      ...transaction,
      portfolioId,
      status: TransactionStatus.MARKET
    };

    await tx.set(transactionDoc.ref, transactionExecuted);
    
    return transactionDoc.id;
  });

  const createdTransaction = await admin.firestore().collection(DB.TRANSACTIONS).doc(transactionId).get();

  return getData<TransactionWithUid>(createdTransaction);
}

async function cancelTransaction(transactionId: string): Promise<TransactionWithUid> { 
  const transactionDoc = await admin.firestore().collection(DB.TRANSACTIONS).doc(transactionId).get();
  const type: TransactionType = transactionDoc.get(TRANSACTION.TYPE);
  const status: TransactionStatus = transactionDoc.get(TRANSACTION.STATUS);

  if (status === TransactionStatus.FULFILLED) {
    throw new Error("Transaction cannot be cancelled: Transaction is already fulfilled");
  }

  if (status === TransactionStatus.CANCELLED) {
    throw new Error("Transaction is already cancelled");
  }

  if (type === TransactionType.BUY) {
    return cancelBuyTransaction(transactionId);
  } else {
    return cancelSellTransaction(transactionId);
  }
}

async function cancelBuyTransaction(transactionId: string): Promise<TransactionWithUid> {
  const cancelledId = await admin.firestore().runTransaction(async (tx) => {
    const transactionDoc = await tx.get(admin.firestore().collection(DB.TRANSACTIONS).doc(transactionId));
    const portfolioId: string = await transactionDoc.get(TRANSACTION.PORTFOLIO_ID);
    const portfolioDoc = await tx.get(admin.firestore().collection(DB.PORTFOLIOS).doc(portfolioId));

    const amount: number = transactionDoc.get(TRANSACTION.AMOUNT);
    const price: number = transactionDoc.get(TRANSACTION.PRICE);
    const balance: number = portfolioDoc.get(PORTFOLIO.BALANCE);

    // Refund price and set transaction to cancelled
    const transactionPrice = amount * price;
    const newBalance = balance + transactionPrice;
    await tx.set(portfolioDoc.ref, { balance: newBalance}, {mergeFields: [PORTFOLIO.BALANCE] });
    await tx.set(transactionDoc.ref, { status: TransactionStatus.CANCELLED }, {mergeFields: [TRANSACTION.STATUS]});
    return transactionDoc.id;
  });

  const cancelledTransaction = await admin.firestore().collection(DB.TRANSACTIONS).doc(cancelledId).get();

  return getData<TransactionWithUid>(cancelledTransaction);
}

async function cancelSellTransaction(transactionId: string): Promise<TransactionWithUid> {
  const cancelledId = await admin.firestore().runTransaction(async (tx) => {
    const transactionDoc = await tx.get(admin.firestore().collection(DB.TRANSACTIONS).doc(transactionId));
    const portfolioId: string = await transactionDoc.get(TRANSACTION.PORTFOLIO_ID);
    const portfolioDoc = await tx.get(admin.firestore().collection(DB.PORTFOLIOS).doc(portfolioId));

    const symbol: string = await transactionDoc.get(TRANSACTION.SYMBOL);
    const stockDoc = await tx.get(portfolioDoc.ref.collection(PORTFOLIO.STOCKS).doc(symbol));
    
    const sellAmount = transactionDoc.get(TRANSACTION.AMOUNT);
    const oldAmount = stockDoc.get(STOCK.AMOUNT);
    const newAmount = oldAmount + sellAmount;
    
    // Refund stock amount and set cancelled
    await tx.set(stockDoc.ref, { amount: newAmount}, { mergeFields: [TRANSACTION.AMOUNT]});
    await tx.set(transactionDoc.ref, { status: TransactionStatus.CANCELLED }, {mergeFields: [TRANSACTION.STATUS]});
    return transactionDoc.id;
  });

  const cancelledTransaction = await admin.firestore().collection(DB.TRANSACTIONS).doc(cancelledId).get();

  return getData<TransactionWithUid>(cancelledTransaction);
}

async function fulfillTransaction(transactionId: string): Promise<TransactionWithUid> {
  const fulfilledId = await admin.firestore().runTransaction(async (tx) => {
    // Get transaction data
    const transactionDoc = await tx.get(admin.firestore().collection(DB.TRANSACTIONS).doc(transactionId));
    const symbol: string = transactionDoc.get(TRANSACTION.SYMBOL);
    const amount: number = transactionDoc.get(TRANSACTION.AMOUNT);
    const price: number = transactionDoc.get(TRANSACTION.PRICE);
    const type: TransactionType = transactionDoc.get(TRANSACTION.TYPE);
    const transactionPrice = amount * price;
    // Get portfolio data
    const portfolioId: string = await transactionDoc.get(TRANSACTION.PORTFOLIO_ID);
    const portfolioDoc = await tx.get(admin.firestore().collection(DB.PORTFOLIOS).doc(portfolioId));
    const balance: number = portfolioDoc.get(PORTFOLIO.BALANCE);
    // Get data about this stock in portfolio
    const stockDoc = await tx.get(portfolioDoc.ref.collection(PORTFOLIO.STOCKS).doc(symbol));
    const currentAmountOfStocks: number = await stockDoc.get(STOCK.AMOUNT) || 0;
    const currentAvgPrice: number = await stockDoc.get(STOCK.AVG_PRICE) || 0;

    if (type === TransactionType.BUY) {
      // Handle BUY:
      // - Update stock amount and average price
      // - No need to update balance, it is done on transaction creation.
      const newAmount = currentAmountOfStocks + amount;
      const newAvgPrice = ((currentAmountOfStocks * currentAvgPrice) + transactionPrice) / newAmount;
      await tx.set(stockDoc.ref, { amount: newAmount, avgPrice: newAvgPrice }, { mergeFields: [STOCK.AMOUNT, STOCK.AVG_PRICE] });
    } else if (type === TransactionType.SELL) {
      // Handle SELL:
      // - Update stock amount ( TODO: Update average price realistically (FIFO))
      // - Update portfolio cash balance.
      const newAmount = currentAmountOfStocks - amount;
      const newBalance = balance + transactionPrice;
      await tx.set(stockDoc.ref, { amount: newAmount }, { mergeFields: [STOCK.AMOUNT] });
      await tx.set(portfolioDoc.ref, { balance: newBalance }, { mergeFields: [PORTFOLIO.BALANCE] });
    } else {
      throw new Error("Transaction type unknown");
    }

    await tx.set(transactionDoc.ref, { status: TransactionStatus.FULFILLED }, {mergeFields: [TRANSACTION.STATUS]});

    return transactionDoc.id;
  });

  const fulfilledTransaction = await admin.firestore().collection(DB.TRANSACTIONS).doc(fulfilledId).get();

  return getData<TransactionWithUid>(fulfilledTransaction);
}

export {
  getTransactionsForPortfolio,
  createTransactionForPortfolio,
  cancelTransaction,
  fulfillTransaction,
}