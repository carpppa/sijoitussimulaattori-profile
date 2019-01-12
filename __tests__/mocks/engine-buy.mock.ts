import { SymbolsPriceData, TransactionStatus, TransactionType, TransactionWithUid } from '../../src/models';

export const mockDivingPrice: SymbolsPriceData = {
  'AAPL': {
    history: [],
    intraday: [
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T00:00:00.000Z")),
        "open": 60 + 50,
        "low": 50 + 50,
        "high": 70 + 50,
        "close": 50 + 50,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T00:10:00.000Z")),
        "open": 60 + 40,
        "low": 50 + 40,
        "high": 70 + 40,
        "close": 50 + 40,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T00:20:00.000Z")),
        "open": 60 + 30,
        "low": 50 + 30,
        "high": 70 + 30,
        "close": 50 + 30,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T00:30:00.000Z")),
        "open": 60 + 20,
        "low": 50 + 20,
        "high": 70 + 20,
        "close": 50 + 20,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T00:40:00.000Z")),
        "open": 60 + 10,
        "low": 50 + 10,
        "high": 70 + 10,
        "close": 50 + 10,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T00:50:00.000Z")),
        "open": 60,
        "low": 50,
        "high": 70,
        "close": 50,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T01:00:00.000Z")),
        "open": 60 - 10,
        "low": 50 - 10,
        "high": 70 - 10,
        "close": 50 - 10,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T01:10:00.000Z")),
        "open": 60 - 20,
        "low": 50 - 20,
        "high": 70 - 20,
        "close": 50 - 20,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T01:20:00.000Z")),
        "open": 60 - 30,
        "low": 50 - 30,
        "high": 70 - 30,
        "close": 50 - 30,
        "volume": 12279994
      }
    ]
  }
}

export const mockBuyTransactions: TransactionWithUid[] = [
  {
    portfolioId: 'test-portfolio-1',
    uid: 'test-tx-1',
    type: TransactionType.BUY,
    symbol: 'AAPL',
    amount: 1,
    price: 39,
    status: TransactionStatus.MARKET,
    expiresAt: new Date(Date.parse("2018-01-01T01:00:00.000Z")),
    createdAt: new Date(Date.parse("2018-01-01T00:00:00.000Z")),
  },
   {
    portfolioId: 'test-portfolio-1',
    uid: 'test-tx-2',
    type: TransactionType.BUY,
    symbol: 'AAPL',
    amount: 1,
    price: 91,
    status: TransactionStatus.MARKET,
    expiresAt: new Date(Date.parse("2018-01-01T01:00:00.000Z")),
    createdAt: new Date(Date.parse("2018-01-01T00:00:00.000Z")),
  },
  {
    portfolioId: 'test-portfolio-1',
    uid: 'test-tx-3',
    type: TransactionType.BUY,
    symbol: 'AAPL',
    amount: 1,
    price: 61,
    status: TransactionStatus.MARKET,
    expiresAt: new Date(Date.parse("2018-01-01T01:00:00.000Z")),
    createdAt: new Date(Date.parse("2018-01-01T00:00:00.000Z")),
  },
  {
    portfolioId: 'test-portfolio-1',
    uid: 'test-tx-4',
    type: TransactionType.BUY,
    symbol: 'AAPL',
    amount: 1,
    price: 51,
    status: TransactionStatus.MARKET,
    expiresAt: new Date(Date.parse("2018-01-01T01:00:00.000Z")),
    createdAt: new Date(Date.parse("2018-01-01T00:00:00.000Z")),
  },
]

export const mockExpiringBuyTransactions: TransactionWithUid[] = [
  {
    portfolioId: 'test-portfolio-1',
    uid: 'test-tx-5',
    type: TransactionType.BUY,
    symbol: 'AAPL',
    amount: 1,
    price: 39,
    status: TransactionStatus.MARKET,
    expiresAt: new Date(Date.parse("2018-01-01T01:00:00.000Z")),
    createdAt: new Date(Date.parse("2018-01-01T00:00:00.000Z")),
  },
   {
    portfolioId: 'test-portfolio-1',
    uid: 'test-tx-6',
    type: TransactionType.BUY,
    symbol: 'AAPL',
    amount: 1,
    price: 29,
    status: TransactionStatus.MARKET,
    expiresAt: new Date(Date.parse("2018-01-01T01:00:00.000Z")),
    createdAt: new Date(Date.parse("2018-01-01T00:00:00.000Z")),
  },
]

export const mockBuyTransactionsShouldFullFillAt: { [key: string]: Date | undefined} = {
  'test-tx-1': undefined,
  'test-tx-2': mockDivingPrice['AAPL'].intraday[1].date,
  'test-tx-3': mockDivingPrice['AAPL'].intraday[4].date,
  'test-tx-4': mockDivingPrice['AAPL'].intraday[5].date,
}
