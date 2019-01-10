import * as Joi from 'joi';

import { CreatedAt, WithUid } from './../utils/firebase-utils';

interface MoneyTransfer {
  sum: number;
}

interface MoneyTransferExecuted extends MoneyTransfer, CreatedAt {
  portfolioId: string;
  oldBalance: number;
  newBalance: number;
}

type MoneyTransferWithUid = MoneyTransferExecuted & WithUid;

const moneyTransferSchema = Joi.object({
  sum: Joi.number().required(),
});

const moneyTransferSchemaWithUidSchema = Joi.object({
  uid: Joi.string(),
  sum: Joi.number().required(),
  portfolioId: Joi.string().required(),
  oldBalance: Joi.number().required(),
  newBalance: Joi.number().required(),
});

export { MoneyTransfer, MoneyTransferWithUid, MoneyTransferExecuted, moneyTransferSchema, moneyTransferSchemaWithUidSchema };
