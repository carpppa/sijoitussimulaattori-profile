import { to } from 'await-to-js';
import { NextFunction, Request, Response } from 'express';
import * as admin from 'firebase-admin';

/** Class presents authentication error. Defines isAuthError property. */
class AuthenticationError extends Error {
  public readonly isAuthError = true;
}

/** Middleware for verifying requests with firebase.
 * Unauthenticated requests will be forwared to errorhandlers.
 * If token is verified, adds request.identity.
 */
function authenticateRequest() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.token;

    if(!token) {
      return next(new AuthenticationError('Authentication token missing from authorization header'));
    }

    // Docs for decodedToken can be found https://firebase.google.com/docs/reference/admin/node/admin.auth.DecodedIdToken
    const [verifyErr, decodedToken] = await to(admin.auth().verifyIdToken(token));

    if(verifyErr || !decodedToken) {
      return next(new AuthenticationError('Error verifying authentication token'));
    }

    if(isExpired(decodedToken)) {
      return next(new AuthenticationError('Authentication token is expired'));
    }

    req.identity = {
      uid: decodedToken.uid
    };

    return next();
  }
}

/** Error handler for authentication errors */
function authErrorHandler() {
  return (
    err: AuthenticationError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if(err && err.isAuthError) {
      res.boom.forbidden(err.message.toString());
    } else {
      next(err);
    }
  };
}

function isExpired(token: admin.auth.DecodedIdToken) {
  const expTime = token.exp; // epoch seconds
  const nowTime = Date.now() / 1000;
  return nowTime >= expTime;
}

export {
  AuthenticationError,
  authenticateRequest,
  authErrorHandler
}
