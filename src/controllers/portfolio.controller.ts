import { Request, Response } from 'express';

import { Portfolio } from '../models';
import { createPortfolioForUser, deletePortfolioFromUser, getPortfoliosForUser, getPortfolioById } from '../services';
import { logger } from '../utils';

const getPortfolios = async (req: Request, res: Response) => {
  try {
    const userId = req.identity.uid;
    const portfolios = await getPortfoliosForUser(userId);

    res.send(portfolios).status(200);
  } catch (error) {
    const err: Error = error;
    logger.error('Get portfolios failed: ', error.toString());
    res.boom.badRequest(err.message)
  }
}

const getPortfolio = async (req: Request, res: Response) => {
  try {
    const portfolioId = req.params.portfolioId;
    const portfolio = await getPortfolioById(portfolioId);

    res.send(portfolio).status(200);
  } catch (error) {
    const err: Error = error;
    logger.error('Get portfolio failed: ', error.toString());
    res.boom.badRequest(err.message)
  }
}

const deletePortfolio = async (req: Request, res: Response) => {
  try {
    const userId = req.identity.uid;
    const portfolioId = req.params.portfolioId;
  
    const deleted = await deletePortfolioFromUser(userId, portfolioId);
    res.send(deleted);
  } catch (error) {
    const err: Error = error;
    logger.error('Delete portfolio failed: ', error.toString());
    res.boom.badRequest(err.message)
  }
}

const postPortfolio = async (req: Request, res: Response) => {
  try {
    const userId = req.identity.uid;
    const portfolio: Portfolio = req.body;

    const createdPortfolio = await createPortfolioForUser(userId, portfolio);
    res.send(createdPortfolio);
  } catch (error) {
    const err: Error = error;
    logger.error('Post portfolios failed: ', error.toString());
    res.boom.badRequest(err.message)
  }
}

export {
  getPortfolios,
  getPortfolio,
  postPortfolio,
  deletePortfolio
}
