import * as admin from 'firebase-admin';

import { DB, PORTFOLIO } from '../firebase-constants';
import { Portfolio, PortfolioWithOwner, PortfolioWithUid } from '../models';
import { asUid, getAll, getData, getDataArray, WithUid } from '../utils';
import { getStocksOfPortfolio, getStocksOfPortfolioWithRevenue } from './portfolio-stocks.service';

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
  // Get stocks and their revenues for portfolio
  const portfolio = await getData<PortfolioWithUid>(doc);
  portfolio.stocks = await getStocksOfPortfolioWithRevenue(portfolioId);
  // Calculate revenue of the portfolio.
  const originalWorth = portfolio.stocks.reduce((acc, stock) => acc + stock.amount * stock.avgPrice, 0);
  const changeOfWorth = portfolio.stocks.reduce((acc, stock) => acc + stock.amount * stock.avgPrice * (stock.revenue || 0), 0);
  portfolio.revenue = changeOfWorth / originalWorth;

  return portfolio;
}

async function createPortfolioForUser(userId: string, portfolio: Portfolio): Promise<PortfolioWithUid> {
  const createdId = await admin.firestore().runTransaction(async (tx) => {
    const portfolioWithOwner: PortfolioWithOwner = {
      balance: 0,
      ...portfolio,
      ownerId: userId,
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
