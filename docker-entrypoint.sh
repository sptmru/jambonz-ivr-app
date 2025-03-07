#!/bin/bash

# Update .env
echo "Updating .env"
sed -i "s|LOG_LEVEL=debug|LOG_LEVEL=${LOG_LEVEL:-info}|" ./build/.env

sed -i "s|SENTRY_DSN=https://1.ingest.us.sentry.io/1|SENTRY_DSN=${SENTRY_DSN:-https://1.ingest.us.sentry.io/1}|" ./build/.env
sed -i "s|SENTRY_TRACES_SAMPLE_RATE=1.0|SENTRY_TRACES_SAMPLE_RATE=${SENTRY_TRACES_SAMPLE_RATE:-1.0}|" ./build/.env
sed -i "s|SENTRY_PROFILES_SAMPLE_RATE=1.0|SENTRY_PROFILES_SAMPLE_RATE=${SENTRY_PROFILES_SAMPLE_RATE:-1.0}|" ./build/.env
sed -i "s|SENTRY_LOG_LEVEL=error|SENTRY_LOG_LEVEL=${SENTRY_LOG_LEVEL:-error}|" ./build/.env
sed -i "s|SENTRY_AUTH_TOKEN=authtoken|SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN:-authtoken}|" ./build/.env

sed -i "s|LOKI_ENABLED=false|LOKI_ENABLED=${LOKI_ENABLED:-false}|" ./build/.env
sed -i "s|LOKI_ENDPOINT=http://loki-gateway.jambonz.svc.cluster.local|LOKI_ENDPOINT=${LOKI_ENDPOINT:-http://loki-gateway.jambonz.svc.cluster.local}|" ./build/.env
sed -i "s|LOKI_LABEL_JOB=ivr-app|LOKI_LABEL_JOB=${LOKI_LABEL_JOB:-ivr-app}|" ./build/.env
sed -i "s|LOKI_JSON=false|LOKI_JSON=${LOKI_JSON:-false}|" ./build/.env
sed -i "s|LOKI_INTERVAL=5|LOKI_INTERVAL=${LOKI_INTERVAL:-5}|" ./build/.env
sed -i "s|LOKI_TIMEOUT=10000|LOKI_TIMEOUT=${LOKI_TIMEOUT:-10000}|" ./build/.env

sed -i "s|GRAYLOG_ENABLED=false|GRAYLOG_ENABLED=${GRAYLOG_ENABLED:-false}|" ./build/.env
sed -i "s|GRAYLOG_HOST=graylog|GRAYLOG_HOST=${GRAYLOG_HOST:-graylog}|" ./build/.env
sed -i "s|GRAYLOG_PORT=12201|GRAYLOG_PORT=${GRAYLOG_PORT:-12201}|" ./build/.env
sed -i "s|GRAYLOG_HOSTNAME=graylog|GRAYLOG_HOSTNAME=${GRAYLOG_HOSTNAME:-graylog}|" ./build/.env
sed -i "s|GRAYLOG_FACILITY=ivrapp|GRAYLOG_FACILITY=${GRAYLOG_FACILITY:-ivrapp}|" ./build/.env
sed -i "s|GRAYLOG_BUFFER_SIZE=1400|GRAYLOG_BUFFER_SIZE=${GRAYLOG_BUFFER_SIZE:-1400}|" ./build/.env

sed -i "s|HTTP_HOSTNAME=http://localhost:8476|HTTP_HOSTNAME=${HTTP_HOSTNAME:-http://localhost:8476}|" ./build/.env
sed -i "s|HTTP_PORT=8476|HTTP_PORT=${HTTP_PORT:-8476}|" ./build/.env

sed -i "s|WS_ENABLED=false|WS_ENABLED=${WS_ENABLED:-false}|" ./build/.env
sed -i "s|WS_PORT=8081|WS_PORT=${WS_PORT:-8081}|" ./build/.env
sed -i "s|WS_HOSTNAME=localhost|WS_HOSTNAME=${WS_HOSTNAME:-localhost}|" ./build/.env
sed -i "s|WS_BASE_URL=ws://localhost:8081|WS_BASE_URL=${WS_BASE_URL:-ws://localhost:8081}|" ./build/.env
sed -i "s|WS_IVR_ENDPOINT=/ivr|WS_IVR_ENDPOINT=${WS_IVR_ENDPOINT:-/ivr}|" ./build/.env

sed -i "s|API_BASE_PREFIX=/api/v1|API_BASE_PREFIX=${API_BASE_PREFIX:-/api/v1}|" ./build/.env
sed -i "s|API_AUTH_TOKEN=agNUL59NL3prrNuLHbQfK9zuux98crULZX9dgsGioYYGAnSZQHqC7JzKmdmDjco3akLaPnDpuGp|API_AUTH_TOKEN=${API_AUTH_TOKEN:-agNUL59NL3prrNuLHbQfK9zuux98crULZX9dgsGioYYGAnSZQHqC7JzKmdmDjco3akLaPnDpuGp}|" ./build/.env

sed -i "s|JAMBONZ_ACCOUNT_SID=1|JAMBONZ_ACCOUNT_SID=${JAMBONZ_ACCOUNT_SID:-1}|" ./build/.env
sed -i "s|JAMBONZ_API_KEY=1|JAMBONZ_API_KEY=${JAMBONZ_API_KEY:-1}|" ./build/.env
sed -i "s|JAMBONZ_APPLICATION_SID=1|JAMBONZ_APPLICATION_SID=${JAMBONZ_APPLICATION_SID:-1}|" ./build/.env
sed -i "s|JAMBONZ_BASE_URL=https://api.jambonz.cloud|JAMBONZ_BASE_URL=${JAMBONZ_BASE_URL:-https://api.jambonz.cloud}|" ./build/.env
sed -i "s|JAMBONZ_CALLBACK_BASE_URL=https://ivr-app.domain.com|JAMBONZ_CALLBACK_BASE_URL=${JAMBONZ_CALLBACK_BASE_URL:-https://ivr-app.domain.com}|" ./build/.env
sed -i "s|JAMBONZ_SIP_REALM=sip.jambonz.cloud|JAMBONZ_SIP_REALM=${JAMBONZ_SIP_REALM:-sip.jambonz.cloud}|" ./build/.env

sed -i "s|JAMBONZ_AMD_THRESHOLD_WORD_COUNT=9|JAMBONZ_AMD_THRESHOLD_WORD_COUNT=${JAMBONZ_AMD_THRESHOLD_WORD_COUNT:-9}|" ./build/.env
sed -i "s|JAMBONZ_AMD_NO_SPEECH_TIMEOUT=5000|JAMBONZ_AMD_NO_SPEECH_TIMEOUT=${JAMBONZ_AMD_NO_SPEECH_TIMEOUT:-5000}|" ./build/.env
sed -i "s|JAMBONZ_AMD_DECISION_TIMEOUT=15000|JAMBONZ_AMD_DECISION_TIMEOUT=${JAMBONZ_AMD_DECISION_TIMEOUT:-15000}|" ./build/.env
sed -i "s|JAMBONZ_AMD_TONE_TIMEOUT=20000|JAMBONZ_AMD_TONE_TIMEOUT=${JAMBONZ_AMD_TONE_TIMEOUT:-20000}|" ./build/.env
sed -i "s|JAMBONZ_AMD_GREETING_COMPLETION_TIMEOUT=2000|JAMBONZ_AMD_GREETING_COMPLETION_TIMEOUT=${JAMBONZ_AMD_GREETING_COMPLETION_TIMEOUT:-2000}|" ./build/.env
sed -i "s|JAMBONZ_DEFAULT_PREFIX=282798|JAMBONZ_DEFAULT_PREFIX=${JAMBONZ_DEFAULT_PREFIX:-282798}|" ./build/.env

sed -i "s|RABBITMQ_URI=amqp://rabbitmq:rabbitmq@rabbitmq:5672|RABBITMQ_URI=${RABBITMQ_URI:-amqp://rabbitmq:rabbitmq@rabbitmq:5672}|" ./build/.env
sed -i "s|RABBITMQ_CALLS_QUEUE=calls_queue|RABBITMQ_CALLS_QUEUE=${RABBITMQ_CALLS_QUEUE:-calls_queue}|" ./build/.env
sed -i "s|RABBITMQ_PREFETCH_COUNT=10|RABBITMQ_PREFETCH_COUNT=${RABBITMQ_PREFETCH_COUNT:-10}|" ./build/.env
sed -i "s|RABBITMQ_RECONNECT_TIMEOUT_MS=5000|RABBITMQ_RECONNECT_TIMEOUT_MS=${RABBITMQ_RECONNECT_TIMEOUT_MS:-5000}|" ./build/.env
sed -i "s|RABBITMQ_USER=rabbitmq|RABBITMQ_USER=${RABBITMQ_USER:-rabbitmq}|" ./build/.env
sed -i "s|RABBITMQ_PASSWORD=rabbitmq|RABBITMQ_PASSWORD=${RABBITMQ_PASSWORD:-rabbitmq}|" ./build/.env
sed -i "s|RABBITMQ_ERLANG_COOKIE=SWQOKODSQALRPCLNMEQG|RABBITMQ_ERLANG_COOKIE=${RABBITMQ_ERLANG_COOKIE:-SWQOKODSQALRPCLNMEQG}|" ./build/.env
sed -i "s|RABBITMQ_HEARTBEAT=60|RABBITMQ_HEARTBEAT=${RABBITMQ_HEARTBEAT:-60}|" ./build/.env
sed -i "s|RABBITMQ_QUEUE_TYPE=classic|RABBITMQ_QUEUE_TYPE=${RABBITMQ_QUEUE_TYPE:-classic}|" ./build/.env

sed -i "s|REDIS_URI=redis://default:lnasdoifna0asd@redis:6379|REDIS_URI=${REDIS_URI:-redis://default:lnasdoifna0asd@redis:6379}|" ./build/.env
sed -i "s|REDIS_JSON_TYPE=calldetails|REDIS_JSON_TYPE=${REDIS_JSON_TYPE:-calldetails}|" ./build/.env
sed -i "s|REDIS_PASSWORD=lnasdoifna0asd|REDIS_PASSWORD=${REDIS_PASSWORD:-lnasdoifna0asd}|" ./build/.env

sed -i "s|CALL_STATUS_API_BASE_URL=https://portal.dialytica.com/api|CALL_STATUS_API_BASE_URL=${CALL_STATUS_API_BASE_URL:-https://portal.dialytica.com/api}|" ./build/.env

sed -i "s|FS_STATUS_API_BASE_URL=http://fs-status-api:8479/api/v1|FS_STATUS_API_BASE_URL=${FS_STATUS_API_BASE_URL:-http://fs-status-api:8479/api/v1}|" ./build/.env
sed -i "s|FS_STATUS_API_BEARER_TOKEN=token|FS_STATUS_API_BEARER_TOKEN=${FS_STATUS_API_BEARER_TOKEN:-token}|" ./build/.env
sed -i "s|FS_STATUS_API_CACHE_TTL=0|FS_STATUS_API_CACHE_TTL=${FS_STATUS_API_CACHE_TTL:-0}|" ./build/.env

sed -i "s|EXPECTED_NUMBER_OF_CONCURRENT_CALLS=20000|EXPECTED_NUMBER_OF_CONCURRENT_CALLS=${EXPECTED_NUMBER_OF_CONCURRENT_CALLS:-20000}|" ./build/.env
sed -i "s|MAX_NUMBER_OF_CONCURRENT_CALLS_PER_INSTANCE=20|MAX_NUMBER_OF_CONCURRENT_CALLS_PER_INSTANCE=${MAX_NUMBER_OF_CONCURRENT_CALLS_PER_INSTANCE:-20}|" ./build/.env

sed -i "s|DTMF_GATHER_TIMEOUT=15|DTMF_GATHER_TIMEOUT=${DTMF_GATHER_TIMEOUT:-15}|" ./build/.env

# Start service
echo "Starting app"
cd build && node app.js
