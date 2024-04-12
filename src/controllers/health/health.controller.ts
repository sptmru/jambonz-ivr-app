import { FastifyReply, FastifyRequest } from 'fastify';
import { RedisClient } from '../../infrastructure/redis/client';
import { MQClient } from '../../infrastructure/rabbitmq/client';

export class HealthController {
  static healthcheck(_request: FastifyRequest, reply: FastifyReply): FastifyReply {
    const redisConnected = RedisClient.getInstance().isConnected;
    const mqConsuming = MQClient.getInstance().isConnected;
    return redisConnected && mqConsuming
      ? reply.code(200).send({ message: 'API is alive!' })
      : reply.code(500).send({ error: mqConsuming ? 'Redis connection lost' : 'RabbitMQ connection lost' });
  }
}
