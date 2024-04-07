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
    applicationSid: parsedConfig?.JAMBONZ_APPLICATION_SID != null ? parsedConfig.JAMBONZ_APPLICATION_SID : '1',
    baseUrl: parsedConfig?.JAMBONZ_BASE_URL != null ? parsedConfig.JAMBONZ_BASE_URL : 'https://api.jambonz.cloud',
    sipRealm: parsedConfig?.JAMBONZ_SIP_REALM != null ? parsedConfig.JAMBONZ_SIP_REALM : 'sip.jambonz.cloud',
    callbackBaseUrl:
      parsedConfig?.JAMBONZ_CALLBACK_BASE_URL != null
        ? parsedConfig.JAMBONZ_CALLBACK_BASE_URL
        : 'https://ivr-app.domain.com',
  },
  rabbitmq: {
    uri: parsedConfig?.RABBITMQ_URI != null ? parsedConfig.RABBITMQ_URI : 'amqp://guest:guest@localhost:5672',
    callsQueue: parsedConfig?.RABBITMQ_CALLS_QUEUE != null ? parsedConfig.RABBITMQ_CALLS_QUEUE : 'calls_queue',
    prefetchCount: parsedConfig?.RABBITMQ_PREFETCH_COUNT != null ? Number(parsedConfig.RABBITMQ_PREFETCH_COUNT) : 10,
  },
  redis: {
    uri: parsedConfig?.REDIS_URI != null ? parsedConfig.REDIS_URI : 'redis://default:lnasdoifna0asd@localhost:6379',
    jsonType: parsedConfig?.REDIS_JSON_TYPE != null ? parsedConfig.REDIS_JSON_TYPE : 'calldetails',
  },
};
