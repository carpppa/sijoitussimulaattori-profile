import { DailyQuote, TransactionWithUid } from '../models';

/** Defines profile-services needed by transaction engine */
interface IProfileData {
  getPendingTransactions(): Promise<TransactionWithUid[]>,
  fulfillTransaction(transactionId: string, fulfilled?: Date): Promise<TransactionWithUid>,
  cancelTransaction(transactionId: string): Promise<TransactionWithUid>,
}

/** Defines stock-services needed by transaction engine */
interface IStockData {
  getHistory(symbol: string, from?: Date, to?: Date): Promise<DailyQuote[]>
  getIntraday(symbol: string): Promise<DailyQuote[]>
}

/** Defines API for fetching prices */
interface IPriceData {
  getPrices(symbols: string[], from?: Date, to?: Date): Promise<SymbolsPriceData>
}

interface PriceData {
  history: DailyQuote[],
  intraday: DailyQuote[],
}

/** Defines symbol-price dictionary */
interface SymbolsPriceData {
  [key: string]: PriceData
}

export {
  IProfileData,
  IStockData,
  PriceData,
  SymbolsPriceData,
  IPriceData,
}
