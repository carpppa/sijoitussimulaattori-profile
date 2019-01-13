import { WithUid } from '../utils';

interface StockInPortfolio {
  amount: number;
  avgPrice: number;
}

type StockInPortfolioWithUid = StockInPortfolio & WithUid;

interface StockInPortfolioWithRevenue extends StockInPortfolioWithUid {
  revenue?: number;
}

export {
  StockInPortfolio,
  StockInPortfolioWithUid,
  StockInPortfolioWithRevenue,
}
