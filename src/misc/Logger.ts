import * as winston from 'winston';
import Sentry from 'winston-transport-sentry-node';
import logdnaWinston from 'logdna-winston';

import { config } from '../infrastructure/config/config';

const timestampFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

const sentryOptions = {
  sentry: {
    dsn: config.sentry.dsn,
  },
  level: config.sentry.logLevel,
};

const logDnaOptions = {
  key: config.logDna.key,
  hostname: config.logDna.hostname,
  app: config.logDna.app,
  env: config.logDna.env,
  level: config.logDna.logLevel,
  indexMeta: true,
  handleExceptions: true,
};

const logger = winston.createLogger({
  level: config.logLevel,
  format: timestampFormat,
  defaultMeta: {},
  transports: [new winston.transports.Console(), new Sentry(sentryOptions), new logdnaWinston(logDnaOptions)],
});

export { logger };
