import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as Joi from 'joi';
import * as boom from 'express-boom';
import * as bearerToken from 'express-bearer-token';
import * as expressWinston from 'express-winston';

import { NextFunction, Request, Response } from 'express';
import { Routes } from './routes';
import { authErrorHandler } from './utils/firebase-express-auth';
import { logger } from './utils/logger';
import { notAccessableResourceErrorHandler } from './utils/firebase-ownership-middleware';

interface JoiExpressError extends Error {
  error: Joi.ValidationError;
}

class App {
  public app: express.Application;
  public routeProvider: Routes = new Routes();

  constructor() {
    this.app = express();
    this.routeConfig();
    this.routeProvider.routes(this.app);
    this.config();
  }

  private routeConfig(): void {
    // Support application/json type post data
    this.app.use(bodyParser.json());

    // Support application/x-www-form-urlencoded post data
    this.app.use(bodyParser.urlencoded({ extended: false }));

    // Boom HTTP errors
    this.app.use(boom());

    // Bearer token parser
    this.app.use(bearerToken());

    this.app.use(
      expressWinston.logger({
        winstonInstance: logger,
        level: 'debug',
        msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}}',
        colorize: true,
      })
    );
  }

  private config(): void {
    // Joi validation
    this.app.use(
      (
        err: JoiExpressError,
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        // Check if it was Joi validation error:
        const validationError = err.error as Joi.ValidationError;
        if (validationError && validationError.isJoi) {
          res.boom.badRequest(err.error.toString(), {
            validation: validationError.details.map((details) => ({
              message: details.message,
              path: details.path,
            })),
          });
        } else {
          // Not joi error, pass forward
          next(err);
        }
      }
    );

    // Authentication errors
    this.app.use(authErrorHandler());

    // Resource ownership errors
    this.app.use(notAccessableResourceErrorHandler())
  }
}

export default new App().app;
