import { to } from 'await-to-js';
import { NextFunction, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { portfolioBelongsToUser } from '../services';

/** Class presents authentication error. Defines isAuthError property. */
class NotAccessibleResourceError extends Error {
  public readonly isNotAccessibleResourceError = true;
}

/** Error handler for authentication errors */
function notAccessableResourceErrorHandler() {
  return (
    err: NotAccessibleResourceError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if(err && err.isNotAccessibleResourceError) {
      res.boom.notFound(err.message.toString());
    } else {
      next(err);
    }
  };
}

/** Middleware for verifying requests with firebase.
 * Ensures that requested resource is owned by the user
 */
function ensurePortfolioOwnership() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.identity.uid;
    const portfolioId = req.params.portfolioId;
    
    const isOwner = await portfolioBelongsToUser(userId, portfolioId);

    if(!isOwner) {
      return next(new NotAccessibleResourceError("Portfolio requested does not belong to the authenticated user."));
    }

    return next();
  }
}

export {
  notAccessableResourceErrorHandler,
  NotAccessibleResourceError,
  ensurePortfolioOwnership,
}