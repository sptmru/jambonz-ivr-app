import { FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../../misc/Logger';
import { CallbacksService } from '../../services/calls/callback.service';

export class CallbacksController {
  static ivrCallback(_request: FastifyRequest, reply: FastifyReply): FastifyReply {
    try {
      const callHandler = CallbacksService.ivrCallback();
      logger.debug(`Call handler generated`);
      logger.debug(callHandler);
      return reply.code(200).send(callHandler?.payload);
    } catch (err) {
      logger.error(`Error while handling a call in IVR callback: ${err.message}`);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  static async statusCallback(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    try {
      logger.debug(`Call status received`);
      logger.debug(request.body);
      return await reply.code(200).send({ message: 'Call status logged' });
    } catch (err) {
      logger.error(`Error while logging call status in a callback: ${err.message}`);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
}
