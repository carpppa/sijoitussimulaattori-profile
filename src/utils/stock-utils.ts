import * as _ from 'lodash';

import { StockInPortfolioWithUid, TransactionWithUid } from '../models';
import { getDate } from './firebase-utils';

function findOldestTransactionCreatedAt(transactions: TransactionWithUid[]): Date {
  return new Date(Math.min(...transactions.map(tx => getDate(tx.createdAt).getTime())));
}

function filterSymbols(transactions: TransactionWithUid[]): string[] {
  const symbols = transactions.map(tx => tx.symbol);
  return  _.uniq(symbols);
}

function filterSymbolsFromStocks(stocks: StockInPortfolioWithUid[]): string[] {
  const symbols = stocks.map(tx => tx.uid);
  return  _.uniq(symbols);
}

function isExpired(transaction: TransactionWithUid, nowMoment: Date): boolean {
  return getDate(transaction.expiresAt).getTime() <= nowMoment.getTime();
}

function isNotExpired(transaction: TransactionWithUid, nowMoment: Date): boolean {
  return !isExpired(transaction, nowMoment);
}

export {
  findOldestTransactionCreatedAt,
  filterSymbols,
  filterSymbolsFromStocks,
  isExpired,
  isNotExpired,
}
