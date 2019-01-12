import * as express from 'express';
import { Request, Response } from 'express';
import * as validation from 'express-joi-validation';
import * as swaggerUi from 'swagger-ui-express';

import {
  deletePortfolio,
  deleteTransaction,
  getPortfolio,
  getPortfolios,
  getTransactions,
  postPortfolio,
  postTransaction,
} from './controllers';
import { getMoneyTransfers, postMoneyTransfer } from './controllers/money-transfer.controller';
import * as swaggerDocument from './docs/swagger.json';
import { helloSchema, portfolioIdSchema, portfolioSchema, transactionIdSchema, transactionSchema } from './models';
import { moneyTransferSchema } from './models/money-transfer';
import { authenticateRequest } from './utils';
import { ensurePortfolioOwnership } from './utils/firebase-ownership-middleware';

export class Routes {
  private validator = validation({ passError: true });

  public routes(app: express.Application): void {

    app
      .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

    app
      .route('/')
      .get((req: Request, res: Response) => {
      res.status(200).send({
        message: 'Hello, World!',
      });
    });

    app
      .route('/hello')
      .get(this.validator.body(helloSchema), (req: Request, res: Response) => {
        res.status(200).send({
          message: `Hello, ${req.body.name.first}!`,
        });
      });

    app
      .route('/auth/hello')
      .get(authenticateRequest(), (req: Request, res: Response) => {
        res.status(200).send({
          message: `Hello!`,
          uid: req.identity.uid,
        });
      })

      app
        .route('/profile/portfolio')
        .get(
          authenticateRequest(),
          getPortfolios
        );

      app
        .route('/profile/portfolio')
        .post(
          authenticateRequest(),
          this.validator.body(portfolioSchema),
          postPortfolio
        );

      app
        .route('/profile/portfolio/:portfolioId')
        .delete(
          authenticateRequest(),
          this.validator.params(portfolioIdSchema),
          ensurePortfolioOwnership(),
          deletePortfolio
        );

      app
        .route('/profile/portfolio/:portfolioId')
        .get(
          authenticateRequest(),
          this.validator.params(portfolioIdSchema),
          ensurePortfolioOwnership(),
          getPortfolio
        );

      app
        .route('/profile/portfolio/:portfolioId/balance')
        .get(
          authenticateRequest(),
          this.validator.params(portfolioIdSchema),
          ensurePortfolioOwnership(),
          getMoneyTransfers
        );

      app
        .route('/profile/portfolio/:portfolioId/balance')
        .post(
          authenticateRequest(),
          this.validator.params(portfolioIdSchema),
          this.validator.body(moneyTransferSchema),
          ensurePortfolioOwnership(),
          postMoneyTransfer
        );

      app
        .route('/profile/portfolio/:portfolioId/transaction')
        .get(
          authenticateRequest(),
          this.validator.params(portfolioIdSchema),
          ensurePortfolioOwnership(),
          getTransactions
        );

      app
        .route('/profile/portfolio/:portfolioId/transaction')
        .post(
          authenticateRequest(),
          this.validator.params(portfolioIdSchema),
          this.validator.body(transactionSchema),
          ensurePortfolioOwnership(),
          postTransaction
        );

      app
        .route('/profile/portfolio/:portfolioId/transaction/:transactionId')
        .delete(
          authenticateRequest(),
          this.validator.params(portfolioIdSchema),
          this.validator.params(transactionIdSchema),
          ensurePortfolioOwnership(),
          deleteTransaction
        );

  }
}
