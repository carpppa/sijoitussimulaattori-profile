import { DailyQuote, PriceData, StockInPortfolioWithRevenue, StockInPortfolioWithUid, SymbolsPriceData } from '../models';

function calculateStockRevenues(ownedStocks: StockInPortfolioWithUid[], prices: SymbolsPriceData): StockInPortfolioWithRevenue[] {
  return ownedStocks.map<StockInPortfolioWithRevenue>(stock => {
    const price = prices[stock.uid];

    if (!price) {
      return stock;
    }

    const latestPrice = getLatestPrice(price);

    if (!latestPrice) {
      return stock;
    }

    return { ...stock, revenue: getRevenue(stock, latestPrice) };
  });
}

function getLatestPrice(prices: PriceData): DailyQuote | undefined {
  const { history, intraday } = prices;

  if (intraday) {
    const latestDate = Math.max(...intraday.map(i => i.date.getTime()));
    return intraday.find(t => t.date.getTime() === latestDate);
  }

  if (history) {
    const latestDate = Math.max(...history.map(i => i.date.getTime()));
    return history.find(t => t.date.getTime() === latestDate);
  }
}

function getRevenue(stock: StockInPortfolioWithUid, price: DailyQuote): number {
  if (stock.avgPrice === 0 || price.close === 0) {
    return 0;
  }
  return price.close / stock.avgPrice - 1;
}

export {
  calculateStockRevenues,
}
