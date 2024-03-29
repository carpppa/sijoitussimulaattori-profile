import { Request, Response } from 'express';

import { MoneyTransfer } from '../models/';
import { createMoneytransferForPortfolio, getMoneytransfersForPortfolio } from '../services';
import { logger, preSerializeMoneytransfer } from '../utils';

const getMoneyTransfers = async (req: Request, res: Response) => {
  try {
    const portfolioId: string = req.params.portfolioId;

    const moneyTransfers = (await getMoneytransfersForPortfolio(portfolioId)).map(preSerializeMoneytransfer);
    res.send(moneyTransfers);

  } catch (error) {
    const err: Error = error;
    logger.error('Get moneytransfers failed: ', err.toString());
    res.boom.badRequest(err.message)
  }
}

const postMoneyTransfer = async (req: Request, res: Response) => {
  try {
    const portfolioId: string = req.params.portfolioId;
    const moneyTransfer: MoneyTransfer = req.body;

    const createdMoneyTransfer = preSerializeMoneytransfer(await createMoneytransferForPortfolio(portfolioId, moneyTransfer));
    res.send(createdMoneyTransfer);

  } catch (error) {
    const err: Error = error;
    logger.error('Post moneytransfer failed: ', err.toString());
    res.boom.badRequest(err.message)
  }
}

export {
  postMoneyTransfer,
  getMoneyTransfers,
 }
