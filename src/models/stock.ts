import { WithUid } from '../utils';

interface StockInPortfolio {
  amount: number;
  avgPrice: number;
}

type StockInPortfolioWithUid = StockInPortfolio & WithUid;

interface StockInPortfolioWithRevenue extends StockInPortfolioWithUid {
  totalRevenue?: number;
  lastDayRevenue?: number;
  totalMarketValue?: number;
}

export {
  StockInPortfolio,
  StockInPortfolioWithUid,
  StockInPortfolioWithRevenue,
}
