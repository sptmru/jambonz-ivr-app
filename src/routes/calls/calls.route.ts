import { FastifyInstance } from 'fastify';
import { createCallRouteOptions } from './calls.route-options';
import { CallsController } from '../../controllers/calls/calls.controller';

export class CallsRoute {
  public prefix: string = '/call';

  // eslint-disable-next-line require-await
  async routes(fastify: FastifyInstance): Promise<void> {
    fastify.post('/', createCallRouteOptions, CallsController.createCall);
  }
}
