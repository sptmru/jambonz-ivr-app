import { FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../../misc/Logger';
import { CallbacksService } from '../../services/calls/callback.service';
import { AmdResult } from '../../domain/types/amdresult.type';
import { DtmfResult } from '../../domain/types/dtmfresult.type';
import { IvrInitiateResult } from '../../domain/types/ivrinitiateresult.type';
import { CallStatus } from '../../domain/types/callstatus.type';

export class CallbacksController {
  static ivrInitiateCallback(request: FastifyRequest<{ Body: IvrInitiateResult }>, reply: FastifyReply): FastifyReply {
    try {
      const callHandler = CallbacksService.ivrInitiateCallback(request.body);
      return reply.code(200).send(callHandler?.payload);
    } catch (err) {
      logger.error(`Error while handling a call in IVR callback: ${err.message}`);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  static statusCallback(request: FastifyRequest<{ Body: CallStatus }>, reply: FastifyReply): FastifyReply {
    try {
      CallbacksService.statusCallback(request.body);
      return reply.code(200).send({ message: 'Call status logged' });
    } catch (err) {
      logger.error(`Error while logging call status in a callback: ${err.message}`);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  static async amdCallback(request: FastifyRequest<{ Body: AmdResult }>, reply: FastifyReply): Promise<FastifyReply> {
    const result = request.body;
    try {
      const amdHandler = await CallbacksService.amdCallback(result);
      return reply.code(200).send(amdHandler?.payload);
    } catch (err) {
      logger.error(`Error while handling a call in AMD callback: ${err.message}`);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  static dtmfCallback(request: FastifyRequest<{ Body: DtmfResult }>, reply: FastifyReply): FastifyReply {
    try {
      const dtmfHandler = CallbacksService.dtmfCallback(request.body);
      return reply.code(200).send(dtmfHandler?.payload);
    } catch (err) {
      logger.error(`Error while handling a call in DTMF callback: ${err.message}`);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
}
