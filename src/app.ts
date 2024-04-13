import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import newrelic from 'newrelic';

import { CallDetailsDefinition } from './domain/definitions/calldetails.definition';
import { Api } from './infrastructure/api/server';
import { config } from './infrastructure/config/config';
import { MQClient } from './infrastructure/rabbitmq/client';
import { RedisClient } from './infrastructure/redis/client';
import { CallbacksRoute } from './routes/callback/callback.route';
import { CallsRoute } from './routes/calls/calls.route';
import { HealthRoute } from './routes/health/health.route';
import { CallsService } from './services/calls/calls.service';
import { logger } from './misc/Logger';

Sentry.init({
  dsn: config.sentry.dsn,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: config.sentry.tracesSampleRate,
  profilesSampleRate: config.sentry.profilesSampleRate,
});

logger.debug(newrelic);

const api = new Api({
  plugins: [],
  routes: [HealthRoute, CallsRoute, CallbacksRoute],
  definitions: [CallDetailsDefinition],
});

api.listen();

const mq = MQClient.getInstance();
// eslint-disable-next-line require-await
mq.consumeToQueue(config.rabbitmq.callsQueue, CallsService.createCall);

RedisClient.getInstance();

const onShutdown = (): void => {
  void mq.onShutdown();
};

process.on('SIGINT', onShutdown);
process.on('SIGTERM', onShutdown);
