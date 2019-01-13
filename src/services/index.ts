import { IProfileData, IStockData } from '../models';
import { PricesService } from './prices.service';
import { getSingleStockHistory, getSingleStockIntradaily } from './stock-data.service';
import { cancelTransaction, fulfillTransaction, getPendingTransactions } from './transaction.service';

export * from './portfolio.service';
export * from './money-transfer.service';
export * from './transaction.service';
export * from './prices.service';
export * from './stock-data.service';
export * from './portfolio-stocks.service';

/** Services as interfaced object to use in engine. */
const profileDataService: IProfileData = {
  getPendingTransactions,
  fulfillTransaction,
  cancelTransaction,
}

/** Services as interfaced object to use in engine. */
const stockDataService: IStockData = {
  getIntraday: getSingleStockIntradaily,
  getHistory: getSingleStockHistory,
}

const pricesService = new PricesService(stockDataService);

export {
  pricesService,
  profileDataService,
  stockDataService,
}
