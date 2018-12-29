/** Defines collection names */
export const DB = {
  PORTFOLIOS: 'portfolios',
  USERS: 'users',
  MONEY_TRANSFERS: 'moneytransfers',
  TRANSACTIONS: 'transactions',
};

// Define fields.

export const PORTFOLIO = {
  OWNERID: 'ownerId',
  NAME: 'name',
  BALANCE: 'balance',
  STOCKS: 'stocks',
};

export const TRANSFER = {
  OLD_BALANCE: 'oldBalance',
  NEW_BALANCE: 'newBalance',
  SUM: 'sum',
  PORTFOLIO_ID: 'portfolioId',
};

export const TRANSACTION = {
  SYMBOL: 'symbol',
  STATUS: 'status',
  PORTFOLIO_ID: 'portfolioId',
  PRICE: 'price',
  AMOUNT: 'amount',
  TYPE: 'type',
}

export const STOCK = {
  AMOUNT: 'amount',
  AVG_PRICE: 'avgPrice'
}