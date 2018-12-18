declare namespace Express {
  /** Represents user identity. */
  export interface Identity {
    uid: string;
  }

  export interface Request {
    identity: Identity
  }
}
declare module 'express-auth';
