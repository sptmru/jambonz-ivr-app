import jambonzClient from '@jambonz/node-client';

import { config } from '../../infrastructure/config/config';
import axios from 'axios';

export const jambonz = jambonzClient(config.jambonz.sid, config.jambonz.apiKey, { baseUrl: config.jambonz.baseUrl });
export const isApplicationExists = async (): Promise<boolean> => {
  try {
    await axios.get(`${config.jambonz.baseUrl}/v1/Applications/${config.jambonz.applicationSid}`, {
      headers: { Authorization: `Bearer ${config.jambonz.apiKey}` },
    });
    return true;
  } catch (err) {
    return false;
  }
};
