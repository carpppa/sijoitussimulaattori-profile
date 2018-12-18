import app from './src/app';
import { initializeFirebase } from './src/firebase';
import { ensureNecessaryEnvs } from './src/utils/general';
import { getServiceAccount } from './src/utils/get-service-account';

ensureNecessaryEnvs([
  'DATABASE_URL',
  'WEB_API_KEY',
  'DEBUG'
]);

const databaseUrl = process.env.DATABASE_URL as string;

initializeFirebase(databaseUrl, getServiceAccount());

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('Express server listening on port ' + port);
});
