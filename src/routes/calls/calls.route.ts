import { FastifyInstance } from 'fastify';
import { createCallRouteOptions, resolveCallHandlerRouteOptions } from './calls.route-options';
import { CallsController } from '../../controllers/calls/calls.controller';

export class CallsRoute {
  public prefix: string = '/call';

  // eslint-disable-next-line require-await
  async routes(fastify: FastifyInstance): Promise<void> {
    fastify.post('/', createCallRouteOptions, CallsController.createCall);
    fastify.post('/resolve/:callSid', resolveCallHandlerRouteOptions, CallsController.resolveCallHandler);
  }
}
