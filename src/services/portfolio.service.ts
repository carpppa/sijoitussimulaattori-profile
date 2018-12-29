import * as admin from 'firebase-admin';

import { DB } from '../firebase-constants';
import { Portfolio, PortfolioWithUid, PortfolioWithOwner } from '../models';
import { asUid, getData, getDataArray, WithUid } from '../utils';

async function getPortfoliosForUser(userId: string): Promise<PortfolioWithUid[]> {
  return admin.firestore().runTransaction(async (tx) => {
    const portfolioQuery = await admin.firestore()
      .collection(DB.PORTFOLIOS)
      .where("ownerId", "==", userId)
      .get();

    if (portfolioQuery.empty) {
      return [];
    }

    const portfolioDocs = portfolioQuery.docs.map(
      doc => doc.ref
    );

    // This funny syntax is necessary because getAll typing has some kind of bug disallowing direct use of array.
    const head = portfolioDocs.shift()!; // non-null assertion because length has been checked earlier
    const tail = portfolioDocs;
    const portfolios = await admin.firestore().getAll(head, ...tail);

    return getDataArray<PortfolioWithUid>(portfolios);
  })
}

async function createPortfolioForUser(userId: string, portfolio: Portfolio): Promise<PortfolioWithUid> {
  const createdId = await admin.firestore().runTransaction(async (tx) => {
    const portfolioWithOwner: PortfolioWithOwner = {
      ...portfolio,
      ownerId: userId
    }
    const portfolioDoc = admin.firestore().collection(DB.PORTFOLIOS).doc();
    tx.set(portfolioDoc, portfolioWithOwner);

    return portfolioDoc.id;
  });

  const createdDoc = await admin.firestore().collection(DB.PORTFOLIOS).doc(createdId).get();

  return getData<PortfolioWithUid>(createdDoc);
}

async function deletePortfolioFromUser(userId: string, portfolioId: string): Promise<WithUid> {
  const deletedId = await admin.firestore().runTransaction(async (tx) => {
    const portfolioDoc = admin.firestore().collection(DB.PORTFOLIOS).doc(portfolioId);
    portfolioDoc.delete();

    return portfolioDoc.id;
  });

  return asUid(deletedId);
}

export {
  createPortfolioForUser,
  deletePortfolioFromUser,
  getPortfoliosForUser
}
