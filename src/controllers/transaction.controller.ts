import { Request, Response } from 'express';
import { logger } from '../utils';
import { getTransactionsForPortfolio, createTransactionForPortfolio, cancelTransaction } from '../services';
import { Transaction } from '../models';

const getTransactions = async (req: Request, res: Response) => {
  try {
    const portfolioId = req.params.portfolioId;
    const transactions = await getTransactionsForPortfolio(portfolioId);

    res.send(transactions).status(200);
  } catch (error) {
    logger.error('Get transactions failed: ', error.toString());
    throw error;
  }
}

const postTransaction = async (req: Request, res: Response) => {
  try {
    const portfolioId = req.params.portfolioId;
    const transaction: Transaction = req.body;
    
    const created = await createTransactionForPortfolio(portfolioId, transaction);

    res.send(created).status(200);
  } catch (error) {
    logger.error('Post transaction failed: ', error.toString());
    throw error;
  }
}

const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.transactionId;
    const cancelled = await cancelTransaction(transactionId);

    res.send(cancelled).status(200);
  } catch (error) {
    logger.error('Delete transaction failed: ', error.toString());
    throw error;
  }
}

export {
  getTransactions,
  postTransaction,
  deleteTransaction,
}
