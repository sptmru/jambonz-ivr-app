import { FastifyInstance } from 'fastify';
import { IvrCallbackRouteOptions, StatusCallbackRouteOptions } from './callback.route-options';
import { CallbacksController } from '../../controllers/calls/callback.controller';

export class CallbacksRoute {
  public prefix: string = '/';

  // eslint-disable-next-line require-await
  async routes(fastify: FastifyInstance): Promise<void> {
    fastify.post('/ivr-callback', IvrCallbackRouteOptions, CallbacksController.ivrCallback);
    fastify.post('/status-callback', StatusCallbackRouteOptions, CallbacksController.statusCallback);
  }
}
