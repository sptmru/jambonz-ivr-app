import { CallDetailsDefinition } from './domain/definitions/calldetails.definition';
import { Api } from './infrastructure/api/server';
import { config } from './infrastructure/config/config';
import { MQClient } from './infrastructure/rabbitmq/client';
import { logger } from './misc/Logger';
import { CallbacksRoute } from './routes/callback/callback.route';
import { CallsRoute } from './routes/calls/calls.route';
import { HealthRoute } from './routes/health/health.route';
import { CallsService } from './services/calls/calls.service';

const api = new Api({
  plugins: [],
  routes: [HealthRoute, CallsRoute, CallbacksRoute],
  definitions: [CallDetailsDefinition],
});

api.listen();

const mq = new MQClient();
// eslint-disable-next-line require-await
mq.consumeToQueue(config.rabbitmq.callsQueue, CallsService.createCall);

const onShutdown = (): void => {
  void mq.onShutdown();
};

process.on('SIGINT', onShutdown);
process.on('SIGTERM', onShutdown);
