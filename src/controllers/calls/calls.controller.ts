import { FastifyReply, FastifyRequest } from 'fastify';
import { CallDetails } from '../../domain/types/calldetails.type';
import { logger } from '../../misc/Logger';
import { CallsService } from '../../services/calls/calls.service';

export class CallsController {
  static createCall(request: FastifyRequest<{ Body: CallDetails }>, reply: FastifyReply): FastifyReply {
    const callDetails = request.body;
    try {
      CallsService.createCall(callDetails);
      return reply.code(200).send({ message: 'Call created successfully' });
    } catch (err) {
      logger.error(`Error while creating a call via HTTP API: ${err.message}`);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
}
