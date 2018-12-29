import * as admin from 'firebase-admin';

import { DB, PORTFOLIO, TRANSFER } from '../firebase-constants';
import { MoneyTransferWithUid, MoneyTransfer, MoneyTransferExecuted } from '../models';
import { getData, getDataArray, getAll } from '../utils';

async function getMoneytransfersForPortfolio(portfolioId: string): Promise<MoneyTransferWithUid[]> {
  const query = await admin.firestore()
    .collection(DB.MONEY_TRANSFERS)
    .where(TRANSFER.PORTFOLIO_ID, '==', portfolioId)
    .get()

  if(query.empty) {
    return [];
  }

  const transfers = await getAll(query.docs.map(d => d.ref)); 

  return getDataArray<MoneyTransferWithUid>(transfers);

}

async function createMoneytransferForPortfolio(portfolioId: string, transfer: MoneyTransfer): Promise<MoneyTransferWithUid> {
  const createdId = await admin.firestore().runTransaction(async (tx) => {
    const moneyTransfer = await tx.get(admin.firestore().collection(DB.MONEY_TRANSFERS).doc());
    const portfolioDoc = await tx.get(admin.firestore().collection(DB.PORTFOLIOS).doc(portfolioId));

    const oldBalance = portfolioDoc.get(PORTFOLIO.BALANCE) as number;
    const newBalance = oldBalance + transfer.sum;

    if (newBalance < 0) {
      throw new Error('Money transfer cannot be done: Balance would end up negative.')
    }

    const calculatedTransfer: MoneyTransferExecuted = {
      sum: transfer.sum,
      portfolioId,
      oldBalance,
      newBalance,
    }
    
    tx.set(moneyTransfer.ref, calculatedTransfer);
    tx.set(portfolioDoc.ref, {balance: newBalance}, {mergeFields: [PORTFOLIO.BALANCE]})

    return moneyTransfer.id;
  });

  const createdDoc = await admin.firestore().collection(DB.MONEY_TRANSFERS).doc(createdId).get();

  return getData<MoneyTransferWithUid>(createdDoc);
}

export {
  createMoneytransferForPortfolio,
  getMoneytransfersForPortfolio,
}
