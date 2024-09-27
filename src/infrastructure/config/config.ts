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
  loki: {
    enabled: parsedConfig?.LOKI_ENABLED != null ? parsedConfig.LOKI_ENABLED.toLowerCase() === 'true' : false,
    host:
      parsedConfig?.LOKI_ENDPOINT != null
        ? parsedConfig.LOKI_ENDPOINT
        : 'http://loki-gateway.jambonz.svc.cluster.local',
    labels: { job: parsedConfig?.LOKI_LABEL_JOB != null ? parsedConfig.LOKI_LABEL_JOB : 'ivr-app' },
    json: parsedConfig?.LOKI_JSON != null ? parsedConfig.LOKI_JSON.toLowerCase() === 'true' : false,
    interval: parsedConfig?.LOKI_INTERVAL != null ? Number(parsedConfig.LOKI_INTERVAL) : 5,
    timeout: parsedConfig?.LOKI_TIMEOUT != null ? Number(parsedConfig.LOKI_TIMEOUT) : 10000,
  },
  api: {
    port: parsedConfig?.HTTP_PORT != null ? Number(parsedConfig.HTTP_PORT) : 3000,
    hostname: parsedConfig?.HTTP_HOSTNAME != null ? parsedConfig.HTTP_HOSTNAME : 'http://localhost',
    basePrefix: parsedConfig?.API_BASE_PREFIX != null ? parsedConfig.API_BASE_PREFIX : '/api/v1',
    authToken: parsedConfig?.API_AUTH_TOKEN != null ? parsedConfig.API_AUTH_TOKEN : 'secret',
  },
  ws: {
    enabled: parsedConfig?.WS_ENABLED != null ? parsedConfig.WS_ENABLED.toLowerCase() === 'true' : false,
    port: parsedConfig?.WS_PORT != null ? Number(parsedConfig.WS_PORT) : 8081,
    hostname: parsedConfig?.WS_HOSTNAME != null ? parsedConfig.WS_HOSTNAME : '0.0.0.0',
    baseUrl: parsedConfig?.WS_BASE_URL != null ? parsedConfig.WS_BASE_URL : 'ws:/localhost:8081',
    ivrEndpoint: parsedConfig?.WS_IVR_ENDPOINT != null ? parsedConfig.WS_IVR_ENDPOINT : '/ivr',
  },
  jambonz: {
    sid: parsedConfig?.JAMBONZ_ACCOUNT_SID != null ? parsedConfig.JAMBONZ_ACCOUNT_SID : '1',
    defaultPrefix: parsedConfig?.JAMBONZ_DEFAULT_PREFIX != null ? parsedConfig.JAMBONZ_DEFAULT_PREFIX : '',
    apiKey: parsedConfig?.JAMBONZ_API_KEY != null ? parsedConfig.JAMBONZ_API_KEY : '1',
    applicationSid: parsedConfig?.JAMBONZ_APPLICATION_SID != null ? parsedConfig.JAMBONZ_APPLICATION_SID : '1',
    baseUrl: parsedConfig?.JAMBONZ_BASE_URL != null ? parsedConfig.JAMBONZ_BASE_URL : 'https://api.jambonz.cloud',
    sipRealm: parsedConfig?.JAMBONZ_SIP_REALM != null ? parsedConfig.JAMBONZ_SIP_REALM : 'sip.jambonz.cloud',
    amd: {
      thresholdWordCount:
        parsedConfig?.JAMBONZ_AMD_THRESHOLD_WORD_COUNT != null
          ? Number(parsedConfig.JAMBONZ_AMD_THRESHOLD_WORD_COUNT)
          : 9,
      timers: {
        noSpeechTimeoutMs:
          parsedConfig?.JAMBONZ_AMD_NO_SPEECH_TIMEOUT != null
            ? Number(parsedConfig.JAMBONZ_AMD_NO_SPEECH_TIMEOUT)
            : 5000,
        decisionTimeoutMs:
          parsedConfig?.JAMBONZ_AMD_DECISION_TIMEOUT != null
            ? Number(parsedConfig.JAMBONZ_AMD_DECISION_TIMEOUT)
            : 15000,
        toneTimeoutMs:
          parsedConfig?.JAMBONZ_AMD_TONE_TIMEOUT != null ? Number(parsedConfig.JAMBONZ_AMD_TONE_TIMEOUT) : 20000,
        greetingCompletionTimeoutMs:
          parsedConfig?.JAMBONZ_AMD_GREETING_COMPLETION_TIMEOUT != null
            ? Number(parsedConfig.JAMBONZ_AMD_GREETING_COMPLETION_TIMEOUT)
            : 2000,
      },
    },
    audioCache: {
      prefix:
        parsedConfig?.JAMBONZ_AUDIO_CACHE_ENABLED != null &&
        parsedConfig.JAMBONZ_AUDIO_CACHE_ENABLED.toLowerCase() === 'false'
          ? ''
          : 'http_cache://',
    },
    callbackBaseUrl:
      parsedConfig?.JAMBONZ_CALLBACK_BASE_URL != null
        ? parsedConfig.JAMBONZ_CALLBACK_BASE_URL
        : 'https://ivr-app.domain.com',
  },
  rabbitmq: {
    uri: parsedConfig?.RABBITMQ_URI != null ? parsedConfig.RABBITMQ_URI : 'amqp://guest:guest@localhost:5672',
    callsQueue: parsedConfig?.RABBITMQ_CALLS_QUEUE != null ? parsedConfig.RABBITMQ_CALLS_QUEUE : 'calls_queue',
    prefetchCount: parsedConfig?.RABBITMQ_PREFETCH_COUNT != null ? Number(parsedConfig.RABBITMQ_PREFETCH_COUNT) : 10,
    heartbeat: parsedConfig?.RABBITMQ_HEARTBEAT != null ? Number(parsedConfig.RABBITMQ_HEARTBEAT) : 60,
    // eslint-disable-next-line
    queueType: parsedConfig?.RABBITMQ_QUEUE_TYPE !== null && parsedConfig?.RABBITMQ_QUEUE_TYPE?.toLowerCase() === 'quorum' ? 'quorum' : 'classic',
  },
  redis: {
    uri: parsedConfig?.REDIS_URI != null ? parsedConfig.REDIS_URI : 'redis://default:lnasdoifna0asd@localhost:6379',
    jsonType: parsedConfig?.REDIS_JSON_TYPE != null ? parsedConfig.REDIS_JSON_TYPE : 'calldetails',
  },
  thirdParty: {
    callStatusApi: {
      baseUrl:
        parsedConfig?.CALL_STATUS_API_BASE_URL != null
          ? parsedConfig.CALL_STATUS_API_BASE_URL
          : 'https://portal.dialytica.com/api',
    },
  },
  calls: {
    dtmfGatherTimeout: parsedConfig?.DTMF_GATHER_TIMEOUT != null ? Number(parsedConfig.DTMF_GATHER_TIMEOUT) : 15,
  },
};
