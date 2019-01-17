import * as admin from 'firebase-admin';
import * as _ from 'lodash';

import { pricesService } from '.';
import { DB, PORTFOLIO } from '../firebase-constants';
import { PortfolioWithUid, StockInPortfolioWithRevenue, StockInPortfolioWithUid, SymbolsPriceData } from '../models';
import { filterSymbolsFromStocks, getAll, getData, getDataArray } from '../utils';
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

async function getPricesForStocksInPortfolios(portfolioInputs: PortfolioWithUid[]): Promise<SymbolsPriceData> {
  const symbols = await admin.firestore().runTransaction(async tx => {
    const stockRefs = (await Promise.all(portfolioInputs.map(async portfolio => {
      return await admin.firestore()
        .collection(DB.PORTFOLIOS)
        .doc(portfolio.uid)
        .collection(PORTFOLIO.STOCKS)
        .listDocuments()
    }))).reduce((all, curr) => [...all, ...curr], []);

    const stockDocs = await Promise.all(stockRefs.map(s => tx.get(s)));
    const stocks = stockDocs.filter(s => s.exists).map(s => getData<StockInPortfolioWithUid>(s));
    const symbols = filterSymbolsFromStocks(stocks);

    return symbols;
  });

  return await pricesService.getPrices(symbols)
}

async function addValueDataToPortfolios(portfolioInputs: PortfolioWithUid[]): Promise<PortfolioWithUid[]> {
  const portfolios = _.cloneDeep(portfolioInputs);

  const prices = await getPricesForStocksInPortfolios(portfolios);

  return Promise.all(portfolios.map(async portfolio => {
    const stocksQuery = await admin.firestore()
    .collection(DB.PORTFOLIOS)
    .doc(portfolio.uid)
    .collection(PORTFOLIO.STOCKS)
    .get();

    if(stocksQuery.empty) {
      portfolio.stocks = [];
      portfolio.totalMarketValue = portfolio.balance;
      portfolio.lastDayRevenue = 0;
      portfolio.totalRevenue = 0;
      return portfolio;
    }

    const stockInPortfolio = getDataArray<StockInPortfolioWithUid>(await getAll(stocksQuery.docs.map(d => d.ref)));

    const portfolioWithStocks = await addValueDataToPortfolio(portfolio, stockInPortfolio, prices);
    portfolioWithStocks.stocks = undefined;
    return portfolioWithStocks;
  }));
}

async function addValueDataToPortfolio(portfolioInput: PortfolioWithUid, stocks: StockInPortfolioWithUid[], prices: SymbolsPriceData) {
  const portfolio = _.cloneDeep(portfolioInput);
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

async function addStockDataToPortfolio(portfolioInput: PortfolioWithUid): Promise<PortfolioWithUid> {
  const portfolio = _.cloneDeep(portfolioInput);

  const stocksQuery = await admin.firestore()
    .collection(DB.PORTFOLIOS)
    .doc(portfolio.uid)
    .collection(PORTFOLIO.STOCKS)
    .get();

  if(stocksQuery.empty) {
    portfolio.stocks = [];
    portfolio.totalMarketValue = portfolio.balance;
    portfolio.lastDayRevenue = 0;
    portfolio.totalRevenue = 0;
    return portfolio;
  }

  const stocks = getDataArray<StockInPortfolioWithUid>(await getAll(stocksQuery.docs.map(d => d.ref)));
  const symbols = filterSymbolsFromStocks(stocks);
  const prices = await pricesService.getPrices(symbols)

  return await addValueDataToPortfolio(portfolio, stocks, prices);
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
  addValueDataToPortfolios,
}
