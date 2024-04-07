import { FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../../misc/Logger';
import { CallbacksService } from '../../services/calls/callback.service';
import { AmdResult } from '../../domain/types/amdresult.type';
import { DtmfResult } from '../../domain/types/dtmfresult.type';

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

  static amdCallback(request: FastifyRequest<{ Body: AmdResult }>, reply: FastifyReply): FastifyReply {
    const result = request.body;
    try {
      const amdHandler = CallbacksService.amdCallback(result);
      return reply.code(200).send(amdHandler?.payload);
    } catch (err) {
      logger.error(`Error while handling a call in AMD callback: ${err.message}`);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  static dtmfCallback(request: FastifyRequest<{ Body: DtmfResult }>, reply: FastifyReply): FastifyReply {
    try {
      const dtmfHandler = CallbacksService.dtmfCallback(request.body);
      logger.debug(`DTMF handler generated`);
      logger.debug(dtmfHandler);
      return reply.code(200).send(dtmfHandler?.payload);
    } catch (err) {
      logger.error(`Error while handling a call in DTMF callback: ${err.message}`);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
}
