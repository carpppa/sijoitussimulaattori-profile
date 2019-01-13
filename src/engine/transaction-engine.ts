import { IPriceData, IProfileData, TransactionWithUid } from '../models';
import { filterSymbols, findOldestTransactionCreatedAt, logger, preSerializeTransaction } from '../utils';
import { PromiseQueue } from '../utils/promise-queue';
import { getTransactionsToFullfilmentDates } from './engine-utils';

/** Responsible for fulfilling transactions */
class TransactionEngine {

  constructor(
    private profileData: IProfileData,
    private priceData: IPriceData,
  ) {

  }

  async start(interval = 15000): Promise<void> {
    logger.debug("Engine: Starting...");

    const queue = new PromiseQueue({
      interval,
      autorun: true,
    });

    let _this = this;

    const handler = async () => {
      logger.debug("Engine: Checking transactions");
      await _this.doCheck(new Date(Date.now()));
      queue.enqueue(handler);
    };

    queue.enqueue(handler);
  }

  /**
   * - Get transactions
   * - Handle expired (later maybe expire after checking if fulfilled?)
   * - Find oldest pending transaction
   * - Get prices for stocks from oldest pending to now
   * - Handle buys
   * - Handle sells
   */
  async doCheck(to: Date) {
    // Get transactions
    const transactions = (await this.profileData.getPendingTransactions()).map(preSerializeTransaction);
    // Check if any
    if (transactions.length === 0) {
      logger.debug("Engine: No pending transactions");
      return;
    }
    // Find oldest
    const oldest = findOldestTransactionCreatedAt(transactions);
    // Check transactions from oldest to now.
    await this.doCheckBetween(transactions, oldest, to);
  }

  async doCheckBetween(transactions: TransactionWithUid[], from: Date, to: Date) {
    // Get symbols existing in current transactions and find prices for them.
    const symbols = filterSymbols(transactions);
    const prices = await this.priceData.getPrices(symbols, from, to);
    // Get transaction states (which should be fullfilled, which expired, which stays pending)
    const transactionStates = getTransactionsToFullfilmentDates(transactions, prices, new Date(Date.now()));
    // Get fulfillment and expire orders
    const fullfilled = transactionStates.filter(t => t.fulfillment).map(async (t) => this.profileData.fulfillTransaction(t.transaction.uid, t.fulfillment));
    const expired = transactionStates.filter(t => t.expired).map(async (t) => this.profileData.cancelTransaction(t.transaction.uid));
    // Execute orders
    await Promise.all([...fullfilled, ...expired]);

    logger.debug(`Engine: Transactions (${transactions.length}), Fulfilled (${fullfilled.length}), Expired (${expired.length})`);
  }
}

export {
  TransactionEngine,
}
