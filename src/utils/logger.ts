import { createLogger, format, transports } from 'winston';
import winston = require('winston');

import config from '../config';

const logger: winston.Logger = createLogger({
  level: config.app.LOGGER_LEVEL,
  format: format.combine(
    format.colorize({
      all: config.app.NODE_ENV !== 'production',
    }),
    format.simple()
  ),
  transports: [new transports.Console()],
});

export { logger };
