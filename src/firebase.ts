import * as admin from 'firebase-admin';

import config from './config';

/** Implements initialization logic for firebase-admin */
class FirebaseAdmin {

  // Implement singleton pattern
  private static _instance: FirebaseAdmin;
  static get instance() {
    if (!FirebaseAdmin._instance) {
      FirebaseAdmin._instance = new FirebaseAdmin();
    }
    return FirebaseAdmin._instance;
  }

  app: admin.app.App;

  constructor() { }

  connect() {
    if (this.app === undefined) {
      this.initializeConnection();
    }
  }

  disconnect() {
    if (this.app !== undefined) {
      this.app.delete();
    }
  }

  private initializeConnection() {
    this.app = admin.initializeApp({
      credential: admin.credential.cert(config.firebase.SERVICE_ACCOUNT),
      databaseURL:  config.firebase.DATABASE_URL
    })
  }
}

function connect() {
  FirebaseAdmin.instance.connect();
}

function disconnect() {
  FirebaseAdmin.instance.disconnect();
}

async function runWithAdminContext(context: (admin: admin.app.App) => Promise<void>) {
  FirebaseAdmin.instance.connect();
  await context(FirebaseAdmin.instance.app);
  FirebaseAdmin.instance.disconnect();
};

// No need to export instance.app because firebase-admin already returns singleton instance.
export {
  runWithAdminContext,
  connect,
  disconnect
}
