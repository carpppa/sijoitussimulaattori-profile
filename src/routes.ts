import { Request, Response } from 'express';
import * as express from 'express';
import * as validation from 'express-joi-validation';
import * as swaggerUi from 'swagger-ui-express';

import { helloName } from './validation';

import * as swaggerDocument from './docs/swagger.json';

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
      .get(this.validator.body(helloName), (req: Request, res: Response) => {
        res.status(200).send({
          message: `Hello, ${req.body.name.first}!`,
        });
      });
  }
}
