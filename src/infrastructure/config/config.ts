import * as dotenv from 'dotenv';

const parsedConfig = dotenv.config().parsed;

export const config = {
  logLevel: parsedConfig?.LOG_LEVEL != null ? parsedConfig.LOG_LEVEL : 'debug',
  api: {
    port: parsedConfig?.HTTP_PORT != null ? Number(parsedConfig.HTTP_PORT) : 3000,
    hostname: parsedConfig?.HTTP_HOSTNAME != null ? parsedConfig.HTTP_HOSTNAME : 'http://localhost',
    basePrefix: parsedConfig?.API_BASE_PREFIX != null ? parsedConfig.API_BASE_PREFIX : '/api/v1',
  },
  jambonz: {
    sid: parsedConfig?.JAMBONZ_ACCOUNT_SID != null ? parsedConfig.JAMBONZ_ACCOUNT_SID : '1',
    apiKey: parsedConfig?.JAMBONZ_API_KEY != null ? parsedConfig.JAMBONZ_API_KEY : '1',
    baseUrl: parsedConfig?.JAMBONZ_BASE_URL != null ? parsedConfig.JAMBONZ_BASE_URL : 'https://api.jambonz.cloud',
  },
};
