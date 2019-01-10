import * as Joi from 'joi';

import { WithUid } from './../utils/firebase-utils';
import { StockInPortfolioWithUid } from './stock';

interface Portfolio {
  name: string;
  balance?: number;
}

interface PortfolioWithOwner extends Portfolio {
  ownerId: string;
  balance: number;
  stocks?: StockInPortfolioWithUid[];
}

type PortfolioWithUid = PortfolioWithOwner & WithUid;

const portfolioSchema = Joi.object({
  name: Joi.string().required(),
  balance: Joi.number(),
});

const portfolioIdSchema = Joi.object({
  portfolioId: Joi.string().required(),
})

export { Portfolio, PortfolioWithUid, PortfolioWithOwner, portfolioSchema, portfolioIdSchema };
