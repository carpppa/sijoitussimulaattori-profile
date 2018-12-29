import * as Joi from 'joi';

import { WithUid } from './../utils/firebase-utils';

interface Portfolio {
  name: string;
}

type PortfolioWithUid = Portfolio & WithUid;

const portfolioSchema = Joi.object({
  name: Joi.string().required(),
  uid: Joi.string(),
});

const portfolioWithUidSchema = Joi.object({
  portfolioId: Joi.string().required(),
})

export { Portfolio, PortfolioWithUid, portfolioSchema, portfolioWithUidSchema };