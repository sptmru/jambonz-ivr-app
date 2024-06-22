/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from '@jambonz/node-client-ws';

import { logger } from '../../misc/Logger';
import { WsMessageTypeEnum } from '../../domain/types/ws/base/messagetype.enum';
import { WsIvrService } from '../../services/ws/ivr.service';

export class WsIvrEndpoint {
  constructor(initService: (params: { path: string }) => Client) {
    const svc = initService({ path: '/ws/call' });

    svc.on(WsMessageTypeEnum.SESSION_NEW, (session: any) => {
      WsIvrService.handleNewSession(session);
    });

    svc.on(WsMessageTypeEnum.VERB_HOOK, (session: any) => {
      logger.info(`Received message type ${WsMessageTypeEnum.VERB_HOOK} for session ${session.call_sid}`);
    });

    svc.on(WsMessageTypeEnum.CALL_STATUS, (session: any) => {
      logger.info(`Received message type ${WsMessageTypeEnum.CALL_STATUS} for session ${session.call_sid}`);
    });

    svc.on(WsMessageTypeEnum.SESSION_REDIRECT, (session: any) => {
      logger.info(`Received message type ${WsMessageTypeEnum.SESSION_REDIRECT} for session ${session.call_sid}`);
    });

    svc.on(WsMessageTypeEnum.SESSION_RECONNECT, (session: any) => {
      logger.info(`Received message type ${WsMessageTypeEnum.SESSION_RECONNECT} for session ${session.call_sid}`);
    });

    svc.on(WsMessageTypeEnum.VERB_STATUS, (session: any) => {
      logger.info(`Received message type ${WsMessageTypeEnum.VERB_STATUS} for session ${session.call_sid}`);
    });

    svc.on(WsMessageTypeEnum.JAMBONZ_ERROR, (session: any) => {
      logger.info(`Received message type ${WsMessageTypeEnum.JAMBONZ_ERROR} for session ${session.call_sid}`);
    });

    svc.on(WsMessageTypeEnum.ACK, (session: any) => {
      logger.info(`Received message type ${WsMessageTypeEnum.ACK} for session ${session.call_sid}`);
    });

    svc.on(WsMessageTypeEnum.COMMAND, (session: any) => {
      logger.info(`Received message type ${WsMessageTypeEnum.COMMAND} for session ${session.call_sid}`);
    });
  }
}
