import * as admin from 'firebase-admin';

import { getDefinedOrThrow } from './utils/general';
import { getServiceAccount } from './utils/get-service-account';

interface FirebaseAdminConfig {
  serviceAccount: admin.ServiceAccount;
  databaseUrl: string;
}

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
  conf?: FirebaseAdminConfig

  constructor() { }

  connect() {
    if (this.app === undefined) {
      this.initializeConnection();
    }
  }

  disconnect() {
    if (this.app !== undefined) {
      this.conf = undefined;
      this.app.delete();
    }
  }

  private initializeConnection() {
    this.conf = {
      serviceAccount: getServiceAccount(),
      databaseUrl: getDefinedOrThrow(process.env.DATABASE_URL)
    }

    this.app = admin.initializeApp({
      credential: admin.credential.cert(this.conf.serviceAccount),
      databaseURL: this.conf.databaseUrl
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
