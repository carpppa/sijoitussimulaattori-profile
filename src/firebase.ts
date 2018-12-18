import * as admin from 'firebase-admin';

let app: admin.app.App;

function initializeFirebase(databaseUrl: string, serviceAccount: admin.ServiceAccount) {
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseUrl
  })
}

function disconnectFirebase() {
  app.delete();
}

async function runWithAdminContext(databaseUrl: string, serviceAccount: admin.ServiceAccount, context: (admin: admin.app.App) => Promise<void>) {
  initializeFirebase(databaseUrl, serviceAccount);
  await context(app);
  disconnectFirebase();
};

export {
  initializeFirebase,
  disconnectFirebase,
  runWithAdminContext
}
