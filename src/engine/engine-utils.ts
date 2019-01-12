import * as _ from 'lodash';

import { PriceData, SymbolsPriceData, TransactionType, TransactionWithUid } from '../models';
import { getDate, isDefined, logger } from '../utils';

type TransactionHandlingState = {
  transaction: TransactionWithUid,
  fullfilment?: Date,
  expired?: Boolean,
};

/**
 * Goes through a list of transactions, and checks if they qualify for fulfillment.
 * It first checks if there exists price data for the transactions, and then checks if
 * the transactions can be completed. If it cannot, it checks if it was expired.
 *
 * @param transactions
 * @param prices
 */
function getTransactionsToFullfilmentDates(transactions: TransactionWithUid[], prices: SymbolsPriceData): TransactionHandlingState[] {
  return transactions.map(transaction => {
    try {
      const price = prices[transaction.symbol];

      if (!isDefined(price)) {
        logger.debug(`Price for ${transaction.symbol} was not defined`);
        return { transaction };
      }

      const fulfillment = whenTransactionFulfills(transaction, price);

      if (!fulfillment) {
        return { transaction, expired: isExpired(transaction) }
      }

      logger.debug(`Fullfilling transaction ${transaction.uid}`);
      return { transaction, fulfillment, expired: false };

    } catch (err) {
      logger.error(`Handling transaction ${transaction.uid} failed: `, err);
      return { transaction };
    }
  });
}

function whenTransactionFulfills(transaction: TransactionWithUid, price: PriceData): Date | undefined {
  switch(transaction.type) {
    case TransactionType.BUY:
      return whenBuyFulfills(transaction, price);
    case TransactionType.SELL:
      return whenSellFulfills(transaction, price);
    default: {
      throw new Error(`Transaction type ${transaction.type} could not be handled;`)
    }
  }
}

function filterSymbols(transactions: TransactionWithUid[]): string[] {
  const symbols = transactions.map(tx => tx.symbol);
  return  _.uniq(symbols);
}

function whenBuyFulfills(transaction: TransactionWithUid, price: PriceData): Date | undefined {
  // Get needed dates
  const createdAt = getDate(transaction.createdAt);
  const expiresAt = getDate(transaction.expiresAt);
  // Get only prices between transaction was created and expires
  const history = price.history.filter(p => isBetween(p.date, createdAt, expiresAt));
  const intra = price.intraday.filter(p => isBetween(p.date, createdAt, expiresAt));
  const prices = [...history, ...intra].sort((a, b) => dateComparator(a.date, b.date));
  // Find first moment when stock price exceeds transaction price.
  const fulfillmentMoment = prices.find(d => d.low <= transaction.price);
  return fulfillmentMoment ? fulfillmentMoment.date : undefined;
}

/** Returns date when stock price  */
function whenSellFulfills(transaction: TransactionWithUid, price: PriceData): Date | undefined {
  // Get needed dates
  const createdAt = getDate(transaction.createdAt);
  const expiresAt = getDate(transaction.expiresAt);
  // Get only prices between transaction was created and expires
  const history = price.history.filter(p => isBetween(p.date, createdAt, expiresAt));
  const intra = price.intraday.filter(p => isBetween(p.date, createdAt, expiresAt));
  const prices = [...history, ...intra].sort((a, b) => dateComparator(a.date, b.date));
  // Find first moment when stock price exceeds transaction price and its not expired.
  const fulfillmentMoment = prices.find(d => d.high >= transaction.price);
  return fulfillmentMoment ? fulfillmentMoment.date : undefined;
}

function findOldestTransactionCreatedAt(transactions: TransactionWithUid[]): Date {
  return new Date(Math.min(...transactions.map(tx => getDate(tx.createdAt).getTime())));
}

function isExpired(transaction: TransactionWithUid): boolean {
  return getDate(transaction.expiresAt).getTime() >= Date.now();
}

function isNotExpired(transaction: TransactionWithUid): boolean {
  return !isExpired(transaction);
}

function isBetween(value: Date, after: Date, before: Date): boolean {
  return after.getTime() <= value.getTime() && value.getTime() <= before.getTime();
}

function dateComparator(a: Date, b: Date) {
  return b.getTime() - a.getTime();
}

export {
  getTransactionsToFullfilmentDates,
  whenTransactionFulfills,
  filterSymbols,
  whenBuyFulfills,
  whenSellFulfills,
  findOldestTransactionCreatedAt,
  isExpired,
  isNotExpired,
  isBetween,
  dateComparator,
}