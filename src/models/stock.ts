import { WithUid } from '../utils';

interface StockInPortfolio {
  amount: number;
  avgPrice: number;
}

type StockInPortfolioWithUid = StockInPortfolio & WithUid;

export {
  StockInPortfolio,
  StockInPortfolioWithUid,
}
