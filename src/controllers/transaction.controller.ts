import { Request, Response } from 'express';

import { Transaction } from '../models';
import { cancelTransaction, createTransactionForPortfolio, getTransactionsForPortfolio } from '../services';
import { getTimestamp, logger, preSerializeTransaction } from '../utils';

const getTransactions = async (req: Request, res: Response) => {
  try {
    const portfolioId = req.params.portfolioId;

    const transactions = (await getTransactionsForPortfolio(portfolioId)).map(preSerializeTransaction);
    res.send(transactions).status(200);

  } catch (error) {
    const err: Error = error;
    logger.error('Get transactions failed: ', error.toString());
    res.boom.badRequest(err.message)
  }
}

const postTransaction = async (req: Request, res: Response) => {
  try {
    const portfolioId = req.params.portfolioId;
    const transactionInput: Transaction = req.body;
    const transaction: Transaction = {
      ...transactionInput,
      expiresAt: getTimestamp(transactionInput.expiresAt),
    }

    const created = preSerializeTransaction(await createTransactionForPortfolio(portfolioId, transaction));
    res.send(created).status(200);

  } catch (error) {
    const err: Error = error;
    logger.error('Post transaction failed: ', error.toString());
    res.boom.badRequest(err.message)
  }
}

const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.transactionId;

    const cancelled = preSerializeTransaction(await cancelTransaction(transactionId));
    res.send(cancelled).status(200);

  } catch (error) {
    const err: Error = error;
    logger.error('Delete transaction failed: ', error.toString());
    res.boom.badRequest(err.message)
  }
}

export {
  getTransactions,
  postTransaction,
  deleteTransaction,
}
