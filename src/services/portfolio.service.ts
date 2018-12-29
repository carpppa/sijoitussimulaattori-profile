import * as admin from 'firebase-admin';

import { DB } from '../firebase-constants';
import { Portfolio, UserData, PortfolioWithUid, PortfolioWithOwner } from '../models';
import { appendOrCreate, asUid, deleteOrEmpty, getData, getDataArray, WithUid } from '../utils';

async function getPortfoliosForUser(userId: string): Promise<PortfolioWithUid[]> {
  return admin.firestore().runTransaction(async (tx) => {
    // Get user
    const userDoc = admin.firestore().collection(DB.USERS).doc(userId);
    const userData = getData<UserData>(await tx.get(userDoc));

    if (!userData || !userData.portfolios || userData.portfolios.length === 0) {
      return [];
    }

    const portfolioDocs = userData.portfolios.map(
      portfolioId => admin.firestore().collection(DB.PORTFOLIOS).doc(portfolioId)
    );

    const head = portfolioDocs.shift()!; // non-null assertion because length has been checked earlier
    const tail = portfolioDocs;
    const portfolios = await admin.firestore().getAll(head, ...tail);

    return getDataArray<PortfolioWithUid>(portfolios);
  })
}

async function createPortfolioForUser(userId: string, portfolio: Portfolio): Promise<PortfolioWithUid> {
  const createdId = await admin.firestore().runTransaction(async (tx) => {
    // Get user portfolios
    const userDoc = admin.firestore().collection(DB.USERS).doc(userId);
    const oldUserData = getData<UserData>(await tx.get(userDoc));
    // Create portfolio
    const portfolioWithOwner: PortfolioWithOwner = {
      ...portfolio,
      ownerId: userId
    }
    const portfolioDoc = admin.firestore().collection(DB.PORTFOLIOS).doc();
    tx.set(portfolioDoc, portfolioWithOwner);
    // Update user portfolios
    const newUserData: UserData = {
      portfolios: oldUserData ? appendOrCreate(oldUserData.portfolios, portfolioDoc.id) : [portfolioDoc.id]
    }
    tx.set(userDoc, newUserData, {merge: true})

    return portfolioDoc.id;
  });

  const createdDoc = await admin.firestore().collection(DB.PORTFOLIOS).doc(createdId).get();

  return getData<PortfolioWithUid>(createdDoc);
}

async function deletePortfolioFromUser(userId: string, portfolioId: string): Promise<WithUid> {
  const deletedId = await admin.firestore().runTransaction(async (tx) => {
    // Delete portfolio
    const portfolioDoc = admin.firestore().collection(DB.PORTFOLIOS).doc(portfolioId);
    portfolioDoc.delete();

    // Update user portfolios
    const userDoc = admin.firestore().collection(DB.USERS).doc(userId);
    const oldUserData = getData<UserData>(await tx.get(userDoc));

    const newUserData: UserData = {
      portfolios: oldUserData ? deleteOrEmpty(oldUserData.portfolios, portfolioId) : []
    }

    tx.set(userDoc, newUserData, {merge: true})

    return portfolioDoc.id;
  });

  return asUid(deletedId);
}

export {
  createPortfolioForUser,
  deletePortfolioFromUser,
  getPortfoliosForUser
}
