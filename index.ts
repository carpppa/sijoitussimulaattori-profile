import app from './src/app';
import { connect } from './src/firebase';
import { ensureNecessaryEnvs } from './src/utils/general';

ensureNecessaryEnvs([
  'DATABASE_URL',
  'WEB_API_KEY',
  'DEBUG'
]);

connect();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('Express server listening on port ' + port);
});
