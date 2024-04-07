import jambonzClient from '@jambonz/node-client';

import { config } from '../../infrastructure/config/config';

export const jambonz = jambonzClient(config.jambonz.sid, config.jambonz.apiKey, { baseUrl: config.jambonz.baseUrl });
