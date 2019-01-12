import { SymbolsPriceData, TransactionStatus, TransactionType, TransactionWithUid } from '../../src/models';

export const mockRisingPrice: SymbolsPriceData = {
  'AAPL': {
    history: [],
    intraday: [
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T00:00:00.000Z")),
        "open": 60 + 0,
        "low": 50 + 0,
        "high": 70 + 0,
        "close": 50 + 0,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T00:10:00.000Z")),
        "open": 60 + 10,
        "low": 50 + 10,
        "high": 70 + 10,
        "close": 50 + 10,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T00:20:00.000Z")),
        "open": 60 + 20,
        "low": 50 + 20,
        "high": 70 + 20,
        "close": 50 + 20,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T00:30:00.000Z")),
        "open": 60 + 30,
        "low": 50 + 30,
        "high": 70 + 30,
        "close": 50 + 30,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T00:40:00.000Z")),
        "open": 60 + 40,
        "low": 50 + 40,
        "high": 70 + 40,
        "close": 50 + 40,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T00:50:00.000Z")),
        "open": 60 + 50,
        "low": 50 + 50,
        "high": 70 + 50,
        "close": 50 + 50,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T01:00:00.000Z")),
        "open": 60 + 60,
        "low": 50 + 60,
        "high": 70 + 60,
        "close": 50 + 60,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T01:10:00.000Z")),
        "open": 60 + 70,
        "low": 50 + 70,
        "high": 70 + 70,
        "close": 50 + 70,
        "volume": 12279994
      },
      {
        "symbol": "AAPL",
        "date": new Date(Date.parse("2018-01-01T01:20:00.000Z")),
        "open": 60 + 80,
        "low": 50 + 80,
        "high": 70 + 80,
        "close": 50 + 80,
        "volume": 12279994
      }
    ]
  }
}

export const mockSellTransactions: TransactionWithUid[] = [
  {
    portfolioId: 'test-portfolio-1',
    uid: 'test-tx-1',
    type: TransactionType.SELL,
    symbol: 'AAPL',
    amount: 1,
    price: 81,
    status: TransactionStatus.MARKET,
    expiresAt: new Date(Date.parse("2018-01-01T01:00:00.000Z")),
    createdAt: new Date(Date.parse("2018-01-01T00:00:00.000Z")),
  },
  {
    portfolioId: 'test-portfolio-1',
    uid: 'test-tx-2',
    type: TransactionType.SELL,
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
    type: TransactionType.SELL,
    symbol: 'AAPL',
    amount: 1,
    price: 101,
    status: TransactionStatus.MARKET,
    expiresAt: new Date(Date.parse("2018-01-01T01:00:00.000Z")),
    createdAt: new Date(Date.parse("2018-01-01T00:00:00.000Z")),
  },
  {
    portfolioId: 'test-portfolio-1',
    uid: 'test-tx-4',
    type: TransactionType.SELL,
    symbol: 'AAPL',
    amount: 1,
    price: 151,
    status: TransactionStatus.MARKET,
    expiresAt: new Date(Date.parse("2018-01-01T01:00:00.000Z")),
    createdAt: new Date(Date.parse("2018-01-01T00:00:00.000Z")),
  },
]

export const mockExpiringSellTransactions: TransactionWithUid[] = [
  {
    portfolioId: 'test-portfolio-1',
    uid: 'test-tx-5',
    type: TransactionType.SELL,
    symbol: 'AAPL',
    amount: 1,
    price: 131,
    status: TransactionStatus.MARKET,
    expiresAt: new Date(Date.parse("2018-01-01T01:00:00.000Z")),
    createdAt: new Date(Date.parse("2018-01-01T00:00:00.000Z")),
  },
  {
    portfolioId: 'test-portfolio-1',
    uid: 'test-tx-6',
    type: TransactionType.SELL,
    symbol: 'AAPL',
    amount: 1,
    price: 141,
    status: TransactionStatus.MARKET,
    expiresAt: new Date(Date.parse("2018-01-01T01:00:00.000Z")),
    createdAt: new Date(Date.parse("2018-01-01T00:00:00.000Z")),
  },
]

export const mockSellTransactionsShouldFullFillAt: { [key: string]: Date | undefined} = {
  'test-tx-1': mockRisingPrice['AAPL'].intraday[2].date,
  'test-tx-2': mockRisingPrice['AAPL'].intraday[3].date,
  'test-tx-3': mockRisingPrice['AAPL'].intraday[4].date,
  'test-tx-4': undefined,
}
