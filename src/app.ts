import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { CallDetailsDefinition, SipAuthDataDefinition } from './domain/definitions/calldetails.definition';
import { Api } from './infrastructure/api/server';
import { config } from './infrastructure/config/config';
import { MQClient } from './infrastructure/rabbitmq/client';
import { CallbacksRoute } from './routes/callback/callback.route';
import { CallsRoute } from './routes/calls/calls.route';
import { HealthRoute } from './routes/health/health.route';
import { CallsService } from './services/calls/calls.service';
import { WebsocketServer } from './infrastructure/ws/server';
import { WsIvrEndpoint } from './routes/ws/ivr.endpoint';

Sentry.init({
  dsn: config.sentry.dsn,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: config.sentry.tracesSampleRate,
  profilesSampleRate: config.sentry.profilesSampleRate,
});

const api = new Api({
  plugins: [],
  routes: [HealthRoute, CallsRoute, CallbacksRoute],
  definitions: [CallDetailsDefinition, SipAuthDataDefinition],
});
api.listen();

const ws = new WebsocketServer();
ws.addEndpoints([WsIvrEndpoint]);
ws.listen();

const mq = MQClient.getInstance();
// eslint-disable-next-line require-await
mq.consumeToQueue(config.rabbitmq.callsQueue, CallsService.createCall);

const onShutdown = (): void => {
  void mq.onShutdown();
};

process.on('SIGINT', onShutdown);
process.on('SIGTERM', onShutdown);
