import * as Joi from 'joi';

import { CreatedAt, FirebaseTimestamp, WithUid } from './../utils/firebase-utils';

type Symbol = string;

enum TransactionStatus {
  /** On market. Can move to CANCELLED or FULFILLED state.*/
  MARKET = 'MARKET',
  /** Transaction was cancelled and this is final state. */
  CANCELLED = 'CANCELLED',
  /** Transaction was fulfilled and this is final state. */
  FULFILLED = 'FULFILLED'
}

enum TransactionType {
  SELL = 'SELL',
  BUY = 'BUY'
}

interface Transaction {
  symbol: Symbol;
  type: TransactionType;
  amount: number;
  price: number;
  expiresAt: FirebaseTimestamp;
}

interface TransactionExecuted extends Transaction, CreatedAt {
  portfolioId: string;
  status: TransactionStatus;
  fulfilledAt?: FirebaseTimestamp;
  cancelledAt?: FirebaseTimestamp;
}

type TransactionWithUid = TransactionExecuted & WithUid;

const transactionIdSchema = Joi.object({
  transactionId: Joi.string().required(),
})

const transactionSchema = Joi.object({
  symbol: Joi.string().required(),
  amount: Joi.number().positive().integer().required(),
  price: Joi.number().positive().required(),
  type: Joi.only(
    TransactionType.BUY,
    TransactionType.SELL,
  ).required(),
  expiresAt: Joi.date().required(),
});

const transactionWithUidSchema = Joi.object({
  uid: Joi.string().required(),
  portfolioId: Joi.string().required(),
  status: Joi.only(
    TransactionStatus.MARKET,
    TransactionStatus.CANCELLED,
    TransactionStatus.FULFILLED,
  ).required(),
  symbol: Joi.string().required(),
  amount: Joi.number().integer().required(),
  price: Joi.number().positive().required(),
  type: Joi.only(
    TransactionType.BUY,
    TransactionType.SELL,
  ).required(),
});

export { TransactionStatus, Transaction, TransactionExecuted, TransactionWithUid, TransactionType, transactionSchema, transactionWithUidSchema, transactionIdSchema };
