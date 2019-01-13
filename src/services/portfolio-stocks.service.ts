import * as admin from 'firebase-admin';

import { DB, PORTFOLIO } from '../firebase-constants';
import { StockInPortfolioWithRevenue, StockInPortfolioWithUid } from '../models/stock';
import { filterSymbolsFromStocks, getAll, getDataArray } from '../utils';
import { calculateStockRevenues } from './stock-value.service';
import { pricesService } from './index';

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

async function getStocksOfPortfolioWithRevenue(portfolioId: string): Promise<StockInPortfolioWithRevenue[]> {
  const stocksQuery = await admin.firestore()
    .collection(DB.PORTFOLIOS)
    .doc(portfolioId)
    .collection(PORTFOLIO.STOCKS)
    .get();

  if(stocksQuery.empty) {
    return [];
  }

  const stocks = getDataArray<StockInPortfolioWithUid>(await getAll(stocksQuery.docs.map(d => d.ref)));
  const symbols = filterSymbolsFromStocks(stocks);
  const prices = await pricesService.getPrices(symbols)
  const stocksWithRevenues = calculateStockRevenues(stocks, prices);
  return stocksWithRevenues;
}

export {
  getStocksOfPortfolio,
  getStocksOfPortfolioWithRevenue,
}
