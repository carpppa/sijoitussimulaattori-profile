import { TransactionEngine } from './engine/transaction-engine';
import { IProfileData, IStockData } from './models';
import {
  cancelTransaction,
  fulfillTransaction,
  getPendingTransactions,
  getSingleStockHistory,
  getSingleStockIntradaily,
  PricesService,
} from './services';

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

const engine = new TransactionEngine(profileDataService, pricesService);

export {
  engine,
}
