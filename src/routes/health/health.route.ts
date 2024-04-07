import { FastifyInstance } from 'fastify';
import { healthGetRouteOptions } from './health.route-options';
import { HealthController } from '../../controllers/health/health.controller';

export class HealthRoute {
  public prefix = '/health';

  // eslint-disable-next-line require-await
  async routes(fastify: FastifyInstance): Promise<void> {
    fastify.get('', healthGetRouteOptions, HealthController.healthcheck);
  }
}
