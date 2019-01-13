import * as admin from 'firebase-admin';

import { DB, PORTFOLIO } from '../firebase-constants';
import { StockInPortfolioWithUid } from '../models/stock';
import { getAll, getDataArray } from '../utils';

async function getStocksOfPortfolio(portfolioId: string): Promise<StockInPortfolioWithUid[]> {
  const stocksQuery = await admin.firestore()
    .collection(DB.PORTFOLIOS)
    .doc(portfolioId)
    .collection(PORTFOLIO.STOCKS)
    .get();

  if(stocksQuery.empty) {
    return [];
  }

  const stocks = await getAll(stocksQuery.docs.map(d => d.ref));

  return getDataArray<StockInPortfolioWithUid>(stocks);
}

export {
  getStocksOfPortfolio,
}
