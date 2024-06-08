#!/bin/bash

# Update .env
echo "Updating .env"
sed -i "s|LOG_LEVEL=debug|LOG_LEVEL=${LOG_LEVEL:info}|" ./build/.env

sed -i "s|SENTRY_DSN=https://1.ingest.us.sentry.io/1|SENTRY_DSN=${SENTRY_DSN:''}|" ./build/.env
sed -i "s|SENTRY_TRACES_SAMPLE_RATE=1.0|SENTRY_TRACES_SAMPLE_RATE=${SENTRY_TRACES_SAMPLE_RATE:1.0}|" ./build/.env
sed -i "s|SENTRY_PROFILES_SAMPLE_RATE=1.0|SENTRY_PROFILES_SAMPLE_RATE=${SENTRY_PROFILES_SAMPLE_RATE:1.0}|" ./build/.env
sed -i "s|SENTRY_LOG_LEVEL=error|SENTRY_LOG_LEVEL=${SENTRY_LOG_LEVEL:error}|" ./build/.env
sed -i "s|SENTRY_AUTH_TOKEN=authtoken|SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN:authtoken}|" ./build/.env

sed -i "s|HTTP_HOSTNAME=http://localhost:8476|HTTP_HOSTNAME=${HTTP_HOSTNAME:http://localhost:8476}|" ./build/.env
sed -i "s|HTTP_PORT=8476|HTTP_PORT=${HTTP_PORT:8476}|" ./build/.env

sed -i "s|API_BASE_PREFIX=/api/v1|API_BASE_PREFIX=${API_BASE_PREFIX:/api/v1}|" ./build/.env
sed -i "s|API_AUTH_TOKEN=agNUL59NL3prrNuLHbQfK9zuux98crULZX9dgsGioYYGAnSZQHqC7JzKmdmDjco3akLaPnDpuGp|API_AUTH_TOKEN=${API_AUTH_TOKEN:agNUL59NL3prrNuLHbQfK9zuux98crULZX9dgsGioYYGAnSZQHqC7JzKmdmDjco3akLaPnDpuGp}|" ./build/.env

sed -i "s|JAMBONZ_ACCOUNT_SID=1|JAMBONZ_ACCOUNT_SID=${JAMBONZ_ACCOUNT_SID:1}|" ./build/.env
sed -i "s|JAMBONZ_API_KEY=1|JAMBONZ_API_KEY=${JAMBONZ_API_KEY:1}|" ./build/.env
sed -i "s|JAMBONZ_APPLICATION_SID=1|JAMBONZ_APPLICATION_SID=${JAMBONZ_APPLICATION_SID:1}|" ./build/.env
sed -i "s|JAMBONZ_BASE_URL=https://api.jambonz.cloud|JAMBONZ_BASE_URL=${JAMBONZ_BASE_URL:https://api.jambonz.cloud}|" ./build/.env
sed -i "s|JAMBONZ_CALLBACK_BASE_URL=https://ivr-app.domain.com|JAMBONZ_CALLBACK_BASE_URL=${JAMBONZ_CALLBACK_BASE_URL:https://ivr-app.domain.com}|" ./build/.env
sed -i "s|JAMBONZ_SIP_REALM=sip.jambonz.cloud|JAMBONZ_SIP_REALM=${JAMBONZ_SIP_REALM:sip.jambonz.cloud}|" ./build/.env

sed -i "s|JAMBONZ_AMD_THRESHOLD_WORD_COUNT=9|JAMBONZ_AMD_THRESHOLD_WORD_COUNT=${JAMBONZ_AMD_THRESHOLD_WORD_COUNT:9}|" ./build/.env
sed -i "s|JAMBONZ_AMD_NO_SPEECH_TIMEOUT=5000|JAMBONZ_AMD_NO_SPEECH_TIMEOUT=${JAMBONZ_AMD_NO_SPEECH_TIMEOUT:5000}|" ./build/.env
sed -i "s|JAMBONZ_AMD_DECISION_TIMEOUT=15000|JAMBONZ_AMD_DECISION_TIMEOUT=${JAMBONZ_AMD_DECISION_TIMEOUT:15000}|" ./build/.env
sed -i "s|JAMBONZ_AMD_TONE_TIMEOUT=20000|JAMBONZ_AMD_TONE_TIMEOUT=${JAMBONZ_AMD_TONE_TIMEOUT:20000}|" ./build/.env
sed -i "s|JAMBONZ_AMD_GREETING_COMPLETION_TIMEOUT=2000|JAMBONZ_AMD_GREETING_COMPLETION_TIMEOUT=${JAMBONZ_AMD_GREETING_COMPLETION_TIMEOUT:2000}|" ./build/.env

sed -i "s|RABBITMQ_URI=amqp://rabbitmq:rabbitmq@rabbitmq:5672|RABBITMQ_URI=${RABBITMQ_URI:amqp://rabbitmq:rabbitmq@rabbitmq:5672}|" ./build/.env
sed -i "s|RABBITMQ_CALLS_QUEUE=calls_queue|RABBITMQ_CALLS_QUEUE=${RABBITMQ_CALLS_QUEUE:calls_queue}|" ./build/.env
sed -i "s|RABBITMQ_CALL_STATUS_QUEUE=call_status_queue|RABBITMQ_CALL_STATUS_QUEUE=${RABBITMQ_CALL_STATUS_QUEUE:call_status_queue}|" ./build/.env
sed -i "s|RABBITMQ_PREFETCH_COUNT=10|RABBITMQ_PREFETCH_COUNT=${RABBITMQ_PREFETCH_COUNT:10}|" ./build/.env
sed -i "s|RABBITMQ_RECONNECT_TIMEOUT_MS=5000|RABBITMQ_RECONNECT_TIMEOUT_MS=${RABBITMQ_RECONNECT_TIMEOUT_MS:5000}|" ./build/.env
sed -i "s|RABBITMQ_USER=rabbitmq|RABBITMQ_USER=${RABBITMQ_USER:rabbitmq}|" ./build/.env
sed -i "s|RABBITMQ_PASSWORD=rabbitmq|RABBITMQ_PASSWORD=${RABBITMQ_PASSWORD:rabbitmq}|" ./build/.env
sed -i "s|RABBITMQ_ERLANG_COOKIE=SWQOKODSQALRPCLNMEQG|RABBITMQ_ERLANG_COOKIE=${RABBITMQ_ERLANG_COOKIE:SWQOKODSQALRPCLNMEQG}|" ./build/.env

sed -i "s|REDIS_URI=redis://default:lnasdoifna0asd@redis:6379|REDIS_URI=${REDIS_URI:redis://default:lnasdoifna0asd@redis:6379}|" ./build/.env
sed -i "s|REDIS_JSON_TYPE=calldetails|REDIS_JSON_TYPE=${REDIS_JSON_TYPE:calldetails}|" ./build/.env
sed -i "s|REDIS_PASSWORD=lnasdoifna0asd|REDIS_PASSWORD=${REDIS_PASSWORD:lnasdoifna0asd}|" ./build/.env

sed -i "s|CALL_STATUS_API_BASE_URL=https://portal.dialytica.com/api|CALL_STATUS_API_BASE_URL=${CALL_STATUS_API_BASE_URL:https://portal.dialytica.com/api}|" ./build/.env

sed -i "s|DTMF_GATHER_TIMEOUT=15|DTMF_GATHER_TIMEOUT=${DTMF_GATHER_TIMEOUT:15}|" ./build/.env

# Start service
echo "Starting app"
cd build && node app.js