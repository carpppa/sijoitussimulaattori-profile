import * as _ from 'lodash';

import { TransactionType, TransactionWithUid } from '../models';
import { getDate, isDefined } from '../utils';
import { PromiseQueue } from '../utils/promise-queue';
import { IPriceData, IProfileData, PriceData, SymbolsPriceData } from './models';

/** Responsible for fulfilling transactions */
class TransactionEngine {

  constructor(
    private profileData: IProfileData,
    private priceData: IPriceData,
  ) {

  }

  start(interval = 1000): void {
    const queue = new PromiseQueue({
      interval,
      autorun: true
    });
  }

  async doCheck() {
    // TODO:
    // - Get transactions
    // - Handle expired (later maybe expire after checking if fulfilled?)
    // - Find oldest pending transaction
    // - Get prices for stocks from oldest pending to now
    // - Handle buys
    // - Handle sells
    const transactions = await this.profileData.getPendingTransactions();

    const symbols = this.filterSymbols(transactions);
    const buyTransactions = transactions.filter(isNotExpired).filter(t => t.type === TransactionType.BUY);
    const sellTransactions = transactions.filter(isNotExpired).filter(t => t.type === TransactionType.SELL);


    const prices = await this.priceData.getPrices(symbols);

    const expiredTransactions = transactions.filter(isExpired);

    const buys = this.handleBuys(buyTransactions, prices);
    const sells = this.handleSells(sellTransactions, prices);

    await Promise.all([...buys, ...sells]);
  }

  /** Finds all symbols used in transactions and filters duplicates. */
  private filterSymbols(transactions: TransactionWithUid[]): string[] {
    const symbols = transactions.map(tx => tx.symbol);
    return  _.uniq(symbols);
  }

  private handleBuys(transactions: TransactionWithUid[], prices: SymbolsPriceData) {
    return transactions.map(async tx => {
        const price = prices[tx.symbol];

        if (!isDefined(price)) {
          return;
        }

        await this.handleSingleBuy(tx, price);
    });
  }

  private handleSells(transactions: TransactionWithUid[], prices: SymbolsPriceData) {
    return transactions.map(async tx => {
      const price = prices[tx.symbol];

      if (!isDefined(price)) {
        return;
      }

      await this.handleSingleSell(tx, price);
    });
  }

  private async handleSingleBuy(transaction: TransactionWithUid, price: PriceData) {
    try {
      // TODO: Handle buys
    } catch (err) {
      // TODO: log err
    }
  }

  private async handleSingleSell(transaction: TransactionWithUid, price: PriceData) {
    try {
      // TODO: Handle sells
    } catch (err) {
      // TODO: log err
    }
  }
}

function isExpired(transaction: TransactionWithUid): boolean {
  return getDate(transaction.expiresAt).getTime() >= Date.now();
}

function isNotExpired(transaction: TransactionWithUid): boolean {
  return !isExpired(transaction);
}

export {
  TransactionEngine
}
