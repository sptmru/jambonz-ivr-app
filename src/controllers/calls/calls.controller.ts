import { FastifyReply, FastifyRequest } from 'fastify';
import { CallDetails } from '../../domain/types/calldetails.type';
import { logger } from '../../misc/Logger';
import { CallsService } from '../../services/calls/calls.service';
import { RedisClient } from '../../infrastructure/redis/client';

export class CallsController {
  static async createCall(request: FastifyRequest<{ Body: CallDetails }>, reply: FastifyReply): Promise<FastifyReply> {
    if (!RedisClient.getInstance().isConnected) {
      logger.error('Redis is not connected');
      return reply.code(500).send({ error: 'Internal server error' });
    }
    const callDetails = request.body;
    try {
      await CallsService.createCall(callDetails);
      return await reply.code(200).send({ message: 'Call created successfully' });
    } catch (err) {
      logger.error(`Error while creating a call via HTTP API: ${err.message}`);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
}
