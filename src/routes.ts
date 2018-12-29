import { Request, Response } from 'express';
import * as express from 'express';
import * as validation from 'express-joi-validation';
import * as swaggerUi from 'swagger-ui-express';

import { deletePortfolio, getPortfolios, postPortfolio, getPortfolio } from './controllers';
import * as swaggerDocument from './docs/swagger.json';
import { helloSchema, portfolioSchema, portfolioIdSchema } from './models';
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
  }
}
