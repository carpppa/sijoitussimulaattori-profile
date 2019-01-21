import { DailyQuote, PriceData, StockInPortfolioWithRevenue, StockInPortfolioWithUid, SymbolsPriceData } from '../models';

function calculateStockValueDevelopment(ownedStocks: StockInPortfolioWithUid[], prices: SymbolsPriceData) {
  return ownedStocks.map(stock => {
    const price = prices[stock.uid];

    if (!price) {
      return { yesterday: 0, now: 0 };
    }

    const latestIntradayPrice = getLatestIntraDayPrice(price);
    const latestHistoryPrice = getLatestHistoryPrice(price);

    if (!latestIntradayPrice || !latestHistoryPrice) {
      return { yesterday: 0, now: 0 };
    }

    return { yesterday: stock.amount * latestHistoryPrice.close, now: stock.amount * latestIntradayPrice.close };
  });
}

function calculateStockRevenues(ownedStocks: StockInPortfolioWithUid[], prices: SymbolsPriceData): StockInPortfolioWithRevenue[] {
  return ownedStocks.map<StockInPortfolioWithRevenue>(stock => {
    const price = prices[stock.uid];

    if (!price) {
      return stock;
    }

    const latestIntradayPrice = getLatestIntraDayPrice(price);
    const latestHistoryPrice = getLatestHistoryPrice(price);

    if (!latestIntradayPrice || !latestHistoryPrice) {
      return stock;
    }

    return {
      ...stock,
      totalRevenue: getRevenue(stock, latestIntradayPrice),
      lastDayRevenue: getLastDayRevenue(latestHistoryPrice, latestIntradayPrice),
      totalMarketValue: getTotalMarketValue(stock, latestIntradayPrice),
    };
  });
}

function getTotalMarketValue(stock: StockInPortfolioWithUid, price: DailyQuote): number {
  return stock.amount * price.close;
}

function getRevenue(stock: StockInPortfolioWithUid, price: DailyQuote): number {
  if (stock.avgPrice === 0) {
    return 0;
  }
  return price.close / stock.avgPrice - 1;
}

function getLatestIntraDayPrice(prices: PriceData): DailyQuote | undefined {
  const { intraday } = prices;
  const latestDate = Math.max(...intraday.map(i => i.date.getTime()));
  return intraday.find(t => t.date.getTime() === latestDate);
}

function getLatestHistoryPrice(prices: PriceData): DailyQuote | undefined {
  const { history } = prices;
  const latestDate = Math.max(...history.map(i => i.date.getTime()));
  return history.find(t => t.date.getTime() === latestDate);
}

function getLastDayRevenue(latestHistory: DailyQuote, latestIntra: DailyQuote): number {
  if (latestHistory.close === 0) {
    return 0;
  }
  return latestIntra.close / latestHistory.close - 1;
}

export {
  calculateStockRevenues,
  calculateStockValueDevelopment,
}
