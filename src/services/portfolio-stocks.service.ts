import * as admin from 'firebase-admin';
import * as _ from 'lodash';

import { pricesService } from '.';
import { DB, PORTFOLIO } from '../firebase-constants';
import { PortfolioWithUid, StockInPortfolioWithRevenue, StockInPortfolioWithUid } from '../models';
import { filterSymbolsFromStocks, getAll, getDataArray } from '../utils';
import { calculateStockRevenues, calculateStockValueDevelopment } from './stock-value.service';

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

async function addStockDataToPortfolio(portfolioInput: PortfolioWithUid): Promise<PortfolioWithUid> {
  const portfolio = _.cloneDeep(portfolioInput);

  const stocksQuery = await admin.firestore()
    .collection(DB.PORTFOLIOS)
    .doc(portfolio.uid)
    .collection(PORTFOLIO.STOCKS)
    .get();

  if(stocksQuery.empty) {
    portfolio.stocks = [];
    return portfolio;
  }

  const stocks = getDataArray<StockInPortfolioWithUid>(await getAll(stocksQuery.docs.map(d => d.ref)));
  const symbols = filterSymbolsFromStocks(stocks);
  const prices = await pricesService.getPrices(symbols)

  // Calculate total revenue of the portfolio. TODO: Add amount of pending transactions
  portfolio.stocks = calculateStockRevenues(stocks, prices);
  const originalWorth = portfolio.balance + portfolio.stocks.reduce((acc, stock) => acc + stock.amount * stock.avgPrice, 0);
  const changeOfWorth = portfolio.stocks.reduce((acc, stock) => acc + stock.amount * stock.avgPrice * (stock.totalRevenue || 0), 0);
  portfolio.totalRevenue = changeOfWorth / originalWorth;

  // Calculate last day revenue of the portfolio. TODO: Add amount of pending transactions
  const stocksLastDayWorths = calculateStockValueDevelopment(portfolio.stocks, prices);
  const yesterdayWorth = portfolio.balance + stocksLastDayWorths.reduce((acc, i) => acc + i.yesterday, 0);
  const nowWorth = portfolio.balance + stocksLastDayWorths.reduce((acc, i) => acc + i.now, 0);
  portfolio.lastDayRevenue = nowWorth / yesterdayWorth - 1;

  // Calculate
  portfolio.totalMarketValue = nowWorth;

  return portfolio;
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
  addStockDataToPortfolio,
}
