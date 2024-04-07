import { FastifyInstance } from 'fastify';
import {
  AmdCallbackRouteOptions,
  DtmfCallbackRouteOptions,
  IvrInitiateCallbackRouteOptions,
  StatusCallbackRouteOptions,
} from './callback.route-options';
import { CallbacksController } from '../../controllers/calls/callback.controller';

export class CallbacksRoute {
  public prefix: string = '/';

  // eslint-disable-next-line require-await
  async routes(fastify: FastifyInstance): Promise<void> {
    fastify.post('/ivr-callback', IvrInitiateCallbackRouteOptions, CallbacksController.ivrInitiateCallback);
    fastify.post('/status-callback', StatusCallbackRouteOptions, CallbacksController.statusCallback);
    fastify.post('/amd-callback', AmdCallbackRouteOptions, CallbacksController.amdCallback);
    fastify.post('/dtmf-callback', DtmfCallbackRouteOptions, CallbacksController.dtmfCallback);
  }
}
