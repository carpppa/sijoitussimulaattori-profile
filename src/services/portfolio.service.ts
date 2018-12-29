import * as admin from 'firebase-admin';

import { DB, PORTFOLIO } from '../firebase-constants';
import { Portfolio, PortfolioWithUid, PortfolioWithOwner } from '../models';
import { asUid, getData, getDataArray, WithUid, getAll } from '../utils';

async function getPortfoliosForUser(userId: string): Promise<PortfolioWithUid[]> {
  return admin.firestore().runTransaction(async (tx) => {
    const query = await admin.firestore()
      .collection(DB.PORTFOLIOS)
      .where(PORTFOLIO.OWNERID, "==", userId)
      .get();

    if (query.empty) {
      return [];
    }

    const portfolios = await getAll(query.docs.map(d => d.ref));

    return getDataArray<PortfolioWithUid>(portfolios);
  })
}

async function getPortfolioById(portfolioId: string): Promise<PortfolioWithUid> {
  const doc = await admin.firestore().collection(DB.PORTFOLIOS).doc(portfolioId).get();

  if (!doc.exists) {
    throw new Error("Requested portfolio does not exists");
  }

  return getData<PortfolioWithUid>(doc);
}

async function createPortfolioForUser(userId: string, portfolio: Portfolio): Promise<PortfolioWithUid> {
  const createdId = await admin.firestore().runTransaction(async (tx) => {
    const portfolioWithOwner: PortfolioWithOwner = {
      ...portfolio,
      ownerId: userId,
      balance: 0,
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

async function portfolioBelongsToUser(userId: string, portfolioId: string): Promise<Boolean> {
  const portfolioDoc = await admin.firestore().collection(DB.PORTFOLIOS).doc(portfolioId).get();

  if (!portfolioDoc.exists) {
    return false;
  }

  const portfolio = portfolioDoc.data() as PortfolioWithOwner;

  return portfolio.ownerId ? userId === portfolio.ownerId : false;
}

export {
  createPortfolioForUser,
  deletePortfolioFromUser,
  getPortfoliosForUser,
  getPortfolioById,
  portfolioBelongsToUser,
}
