import * as winston from 'winston';
import Sentry from 'winston-transport-sentry-node';

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

const logger = winston.createLogger({
  level: config.log.level,
  format: timestampFormat,
  defaultMeta: {},
  transports: [new winston.transports.Console(), new Sentry(sentryOptions)],
});

if (config.log.logToFile) {
  logger.add(new winston.transports.File({ filename: `${config.log.directory}/${config.log.file}` }));
}

export { logger };
