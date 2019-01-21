import { PriceData, SymbolsPriceData, TransactionType, TransactionWithUid } from '../models';
import { dateComparator, getDate, isBetween, isDefined, isExpired, logger } from '../utils';

type TransactionHandlingState = {
  transaction: TransactionWithUid,
  fulfillment?: Date,
  expired?: Boolean,
};

/**
 * Goes through a list of transactions, and checks if they qualify for fulfillment.
 * It first checks if there exists price data for the transactions, and then checks if
 * the transactions can be completed. If it cannot, it checks if it was expired.
 *
 * @param transactions
 * @param prices
 */
function getTransactionsToFullfilmentDates(transactions: TransactionWithUid[], prices: SymbolsPriceData, moment: Date): TransactionHandlingState[] {
  return transactions.map<TransactionHandlingState>((transaction): TransactionHandlingState => {
    try {
      const price = prices[transaction.symbol];

      if (!isDefined(price)) {
        logger.debug(`Price for ${transaction.symbol} was not defined`);
        return { transaction };
      }

      const fulfillment = whenTransactionFulfills(transaction, price);

      if (!fulfillment) {
        return { transaction, expired: isExpired(transaction, moment) }
      }

      logger.debug(`Fullfilling transaction ${transaction.uid}`);
      return { transaction, fulfillment, expired: false };

    } catch (err) {
      logger.error(`Handling transaction ${transaction.uid} failed: ${err}`);
      return { transaction };
    }
  });
}

function whenTransactionFulfills(transaction: TransactionWithUid, price: PriceData): Date | undefined {
  switch(transaction.type) {
    case TransactionType.BUY:
      return whenBuyFulfills(transaction, price);
    case TransactionType.SELL:
      return whenSellFulfills(transaction, price);
    default: {
      throw new Error(`Transaction type ${transaction.type} could not be handled;`)
    }
  }
}

/** Returns date when stock price dives below buy price*/
function whenBuyFulfills(transaction: TransactionWithUid, price: PriceData): Date | undefined {
  // Get needed dates
  const createdAt = getDate(transaction.createdAt);
  const expiresAt = getDate(transaction.expiresAt);
  // Get only prices between transaction was created and expires
  const history = price.history.filter(p => isBetween(p.date, createdAt, expiresAt));
  const intra = price.intraday.filter(p => isBetween(p.date, createdAt, expiresAt));
  const prices = [...history, ...intra].sort((a, b) => dateComparator(a.date, b.date));
  // Find moments when stock price exceeds transaction price and its not expired.
  const fulfillmentMoments = prices.filter(d => d.low <= transaction.price);
  if (fulfillmentMoments.length === 0) {
    return undefined;
  }
  // Find earliest moment
  const earliestFulfillment = new Date(Math.min(...fulfillmentMoments.map(t => t.date.getTime())));
  return earliestFulfillment;
}

/** Returns date when stock price rises above selling price*/
function whenSellFulfills(transaction: TransactionWithUid, price: PriceData): Date | undefined {
  // Get needed dates
  const createdAt = getDate(transaction.createdAt);
  const expiresAt = getDate(transaction.expiresAt);
  // Get only prices between transaction was created and expires
  const history = price.history.filter(p => isBetween(p.date, createdAt, expiresAt));
  const intra = price.intraday.filter(p => isBetween(p.date, createdAt, expiresAt));
  const prices = [...history, ...intra].sort((a, b) => dateComparator(a.date, b.date));
  // Find moments when stock price exceeds transaction price and its not expired.
  const fulfillmentMoments = prices.filter(d => d.high >= transaction.price);
  if (fulfillmentMoments.length === 0) {
    return undefined;
  }
  // Find earliest moment
  const earliestFulfillment = new Date(Math.min(...fulfillmentMoments.map(t => t.date.getTime())));
  return earliestFulfillment;
}

export {
  getTransactionsToFullfilmentDates,
  whenTransactionFulfills,
  whenBuyFulfills,
  whenSellFulfills,
}
