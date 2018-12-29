/** Defines collection names */
export const DB = {
  PORTFOLIOS: 'portfolios',
  USERS: 'users',
  MONEY_TRANSFERS: 'moneytransfers'
};

// Define fields.

export const PORTFOLIO = {
  OWNERID: 'ownerId',
  NAME: 'name',
  BALANCE: 'balance'
};

export const TRANSFER = {
  OLD_BALANCE: 'oldBalance',
  NEW_BALANCE: 'newBalance',
  SUM: 'sum',
  PORTFOLIO_ID: 'portfolioId',
};