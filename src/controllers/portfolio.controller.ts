import { Request, Response } from 'express';

import { Portfolio } from '../models';
import { createPortfolioForUser, deletePortfolioFromUser, getPortfoliosForUser } from '../services';
import { logger } from '../utils';

const getPortfolios = async (req: Request, res: Response) => {
  try {
    const userId = req.identity.uid;
    const portfolios = await getPortfoliosForUser(userId);

    res.send(portfolios).status(200);
  } catch (error) {
    logger.error('Get portfolios failed: ', error.toString());
    throw error;
  }
}

const deletePortfolio = async (req: Request, res: Response) => {
  try {
    const userId = req.identity.uid;
    const portfolioId = req.params.portfolioId;
  
    const deleted = await deletePortfolioFromUser(userId, portfolioId);
    res.send(deleted);
  } catch (error) {
    logger.error('Delete portfolio failed: ', error.toString());
    throw error;
  }
}

const postPortfolio = async (req: Request, res: Response) => {
  try {
    const userId = req.identity.uid;
    const portfolio: Portfolio = req.body;

    const createdPortfolio = await createPortfolioForUser(userId, portfolio);
    res.send(createdPortfolio);
  } catch (error) {
    logger.error('Post portfolios failed: ', error.toString());
    throw error;
  }
}

export {
  getPortfolios,
  postPortfolio,
  deletePortfolio
}
