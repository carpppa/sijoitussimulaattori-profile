import { ensureNecessaryEnvs } from './utils/general';
import { getServiceAccount } from './utils/get-service-account';

process.on('uncaughtException', (err) => {
  console.log('\x1b[31m', 'error: uncaught exception:', err);
});

// List here the required environment variables:
ensureNecessaryEnvs([
  'NODE_ENV',
  'DATABASE_URL',
  'WEB_API_KEY',
]);

const config = {
  app: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  },
  firebase: {
    SERVICE_ACCOUNT: getServiceAccount(),
    DATABASE_URL: process.env.DATABASE_URL || '',
    WEB_API_KEY: process.env.WEB_API_KEY || ''
  }
}

export default config;
