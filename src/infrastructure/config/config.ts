import * as dotenv from 'dotenv';

const parsedConfig = dotenv.config().parsed;

export const config = {
  log: {
    level: parsedConfig?.LOG_LEVEL != null ? parsedConfig.LOG_LEVEL : 'debug',
    directory: parsedConfig?.LOG_DIRECTORY != null ? parsedConfig.LOG_DIRECTORY : './logs',
    file: `${parsedConfig?.LOG_LEVEL != null ? parsedConfig.LOG_LEVEL : 'debug'}.log`,
    logToFile: parsedConfig?.LOG_TO_FILE != null ? parsedConfig.LOG_TO_FILE.toLowerCase() === 'true' : false,
  },
  sentry: {
    dsn: parsedConfig?.SENTRY_DSN != null ? parsedConfig.SENTRY_DSN : 'https://1.ingest.us.sentry.io/1',
    tracesSampleRate:
      parsedConfig?.SENTRY_TRACES_SAMPLE_RATE != null ? Number(parsedConfig.SENTRY_TRACES_SAMPLE_RATE) : 1.0,
    profilesSampleRate:
      parsedConfig?.SENTRY_PROFILES_SAMPLE_RATE != null ? Number(parsedConfig.SENTRY_PROFILES_SAMPLE_RATE) : 1.0,
    logLevel: parsedConfig?.SENTRY_LOG_LEVEL != null ? parsedConfig.SENTRY_LOG_LEVEL : 'error',
  },
  logDna: {
    key: parsedConfig?.LOGDNA_KEY != null ? parsedConfig.LOGDNA_KEY : 'key',
    hostname: parsedConfig?.LOGDNA_HOSTNAME != null ? parsedConfig.LOGDNA_HOSTNAME : 'ivr-app.sptm.space',
    app: parsedConfig?.LOGDNA_APP_NAME != null ? parsedConfig.LOGDNA_APP_NAME : 'jambonz-ivr-app',
    env: parsedConfig?.LOGDNA_ENV_NAME != null ? parsedConfig.LOGDNA_ENV_NAME : 'production',
    logLevel: parsedConfig?.LOGDNA_LOG_LEVEL != null ? parsedConfig.LOGDNA_LOG_LEVEL : 'info',
  },
  api: {
    port: parsedConfig?.HTTP_PORT != null ? Number(parsedConfig.HTTP_PORT) : 3000,
    hostname: parsedConfig?.HTTP_HOSTNAME != null ? parsedConfig.HTTP_HOSTNAME : 'http://localhost',
    basePrefix: parsedConfig?.API_BASE_PREFIX != null ? parsedConfig.API_BASE_PREFIX : '/api/v1',
    authToken: parsedConfig?.API_AUTH_TOKEN != null ? parsedConfig.API_AUTH_TOKEN : 'secret',
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
    callStatusQueue:
      parsedConfig?.RABBITMQ_CALL_STATUS_QUEUE != null ? parsedConfig.RABBITMQ_CALL_STATUS_QUEUE : 'call_status_queue',
    prefetchCount: parsedConfig?.RABBITMQ_PREFETCH_COUNT != null ? Number(parsedConfig.RABBITMQ_PREFETCH_COUNT) : 10,
  },
  redis: {
    uri: parsedConfig?.REDIS_URI != null ? parsedConfig.REDIS_URI : 'redis://default:lnasdoifna0asd@localhost:6379',
    jsonType: parsedConfig?.REDIS_JSON_TYPE != null ? parsedConfig.REDIS_JSON_TYPE : 'calldetails',
  },
  thirdParty: {
    voslogic: {
      apiBaseUrl:
        parsedConfig?.VOSLOGIC_API_BASE_URL != null
          ? parsedConfig.VOSLOGIC_API_BASE_URL
          : 'http://vos-api.voslogic.com/api',
    },
  },
  calls: {
    dtmfGatherTimeout: parsedConfig?.DTMF_GATHER_TIMEOUT != null ? Number(parsedConfig.DTMF_GATHER_TIMEOUT) : 15,
  },
};
