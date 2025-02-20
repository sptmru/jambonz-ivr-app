import { FastifyReply, FastifyRequest } from 'fastify';
import { CallDetails } from '../../domain/types/calldetails.type';
import { logger } from '../../misc/Logger';
import { CallsService } from '../../services/calls/calls.service';

export class CallsController {
  static createCall(request: FastifyRequest<{ Body: CallDetails }>, reply: FastifyReply): FastifyReply {
    const callDetails = request.body;
    try {
      void CallsService.createCall(callDetails);
      return reply.code(200).send({ message: 'Call created successfully' });
    } catch (err) {
      logger.error(`Error while creating a call via HTTP API: ${err.message}`);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  static resolveCallHandler(
    request: FastifyRequest<{ Params: { callSid: string } }>,
    reply: FastifyReply
  ): FastifyReply {
    const callSid = request.params.callSid;
    try {
      CallsService.resolveCallHandler(callSid);
      return reply.code(200).send({ message: 'Call resolved successfully' });
    } catch (err) {
      logger.error(`Error while resolving a call via HTTP API: ${err.message}`);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
}
