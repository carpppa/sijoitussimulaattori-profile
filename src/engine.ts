import { TransactionEngine } from './engine/transaction-engine';
import { pricesService, profileDataService } from './services';

const engine = new TransactionEngine(profileDataService, pricesService);

export {
  engine,
}
