import * as winston from 'winston';
import Sentry from 'winston-transport-sentry-node';
import LokiTransport from 'winston-loki';

import { config } from '../infrastructure/config/config';
import { ConsoleTransportInstance, FileTransportInstance } from 'winston/lib/winston/transports';
import SentryTransport from 'winston-transport-sentry-node';

type TransportUnion = LokiTransport | SentryTransport | FileTransportInstance | ConsoleTransportInstance;

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

const lokiOptions = {
  host: config.loki.host,
  labels: config.loki.labels,
  json: config.loki.json,
  format: winston.format.json(),
  interval: config.loki.interval,
  timeout: config.loki.timeout,
  onConnectionError: (err: Error): void => {
    console.error(err);
  },
};

const transportListWithFile: TransportUnion[] = [
  new winston.transports.Console({ format: consoleLogFormat }),
  new Sentry(sentryOptions),
  new winston.transports.File({ filename: `${config.log.directory}/${config.log.file}`, format: fileLogFormat }),
];

const transportListWithoutFile: TransportUnion[] = [
  new winston.transports.Console({ format: consoleLogFormat }) as ConsoleTransportInstance,
  new Sentry(sentryOptions) as SentryTransport,
];

if (config.loki.enabled) {
  transportListWithFile.push(new LokiTransport(lokiOptions));
  transportListWithoutFile.push(new LokiTransport(lokiOptions));
}

const logger = winston.createLogger({
  level: config.log.level,
  defaultMeta: {},
  transports: config.log.logToFile ? transportListWithFile : transportListWithoutFile,
});

export { logger };
