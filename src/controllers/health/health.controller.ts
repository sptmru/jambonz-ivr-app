import { FastifyReply, FastifyRequest } from 'fastify';

export class HealthController {
  static healthcheck(_request: FastifyRequest, reply: FastifyReply): FastifyReply {
    return reply.code(200).send({ message: 'API is alive!' });
  }
}
