import * as winston from 'winston';
import Sentry from 'winston-transport-sentry-node';

import { config } from '../infrastructure/config/config';

const consoleLogFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

const sentryOptions = {
  sentry: {
    dsn: config.sentry.dsn,
  },
  level: config.sentry.logLevel,
};

const logger = winston.createLogger({
  level: config.log.level,
  defaultMeta: {},
  transports: config.log.logToFile
    ? [
        new winston.transports.Console({ format: consoleLogFormat }),
        new Sentry(sentryOptions),
        new winston.transports.File({ filename: `${config.log.directory}/${config.log.file}`, format: fileLogFormat }),
      ]
    : [new winston.transports.Console({ format: consoleLogFormat }), new Sentry(sentryOptions)],
});

export { logger };
