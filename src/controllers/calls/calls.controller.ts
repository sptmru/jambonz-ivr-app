import { FastifyReply, FastifyRequest } from 'fastify';
import { CallDetails } from '../../domain/types/calldetails.type';
import { logger } from '../../misc/Logger';

export class CallsController {
  static async createCall(_request: FastifyRequest<{ Body: CallDetails }>, reply: FastifyReply): Promise<FastifyReply> {
    try {
      return await reply.code(200).send({ message: 'Call created successfully' });
    } catch (err) {
      logger.error(`Error while creating a call via HTTP API: ${err.message}`);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
}
