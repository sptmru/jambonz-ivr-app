import * as winston from 'winston';

import { config } from '../infrastructure/config/config';
const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: {},
  transports: [new winston.transports.Console()],
});

export { logger };
