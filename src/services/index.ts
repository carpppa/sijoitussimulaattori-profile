import { IProfileData } from '../models';
import { cancelTransaction, fulfillTransaction, getPendingTransactions } from './transaction.service';

export * from './portfolio.service';
export * from './money-transfer.service';
export * from './transaction.service';
export * from './prices.service';
export * from './stock-data.service';
export * from './portfolio-stocks.service';

/** Services as interfaced object to use in engine. Helps mocking up for tests. */
export const profileDataService: IProfileData = {
  getPendingTransactions,
  fulfillTransaction,
  cancelTransaction,
}
