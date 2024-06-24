import { Client, Session } from '@jambonz/node-client-ws';

import { logger } from '../../misc/Logger';
import { WsMessageTypeEnum } from '../../domain/types/ws/base/messagetype.enum';
import { WsIvrService } from '../../services/ws/ivr.service';
import { WsDtmfEvent } from '../../domain/types/ws/events/dtmfevent.type';
import { config } from '../../infrastructure/config/config';
import { WsAmdEvent } from '../../domain/types/ws/events/amdevent.type';

export class WsIvrEndpoint {
  constructor(initService: (params: { path: string }) => Client) {
    const client = initService({ path: `${config.ws.ivrEndpoint}` });

    client.on(WsMessageTypeEnum.SESSION_NEW, (session: Session) => {
      session
        .on('close', this.onClose.bind(null, session))
        .on('error', this.onError.bind(null, session))
        .on('/dtmf', this.handleDtmf.bind(null, session))
        .on('/amd', this.handleAmd.bind(null, session));

      WsIvrService.handleNewSession({ client, session });
    });

    client.on(WsMessageTypeEnum.SESSION_RECONNECT, (session: Session) => {
      logger.debug(`Got ${WsMessageTypeEnum.SESSION_RECONNECT} event for call ID ${session.call_id}`);
    });

    client.on(WsMessageTypeEnum.SESSION_REDIRECT, (session: Session) => {
      logger.debug(`Got ${WsMessageTypeEnum.SESSION_REDIRECT} event with message ID  ${session.msgid}`);
    });

    client.on(WsMessageTypeEnum.CALL_STATUS, (session: Session) => {
      logger.debug(`Got ${WsMessageTypeEnum.CALL_STATUS} event with message ID  ${session.msgid}`);
    });

    client.on(WsMessageTypeEnum.VERB_HOOK, (session: Session) => {
      logger.debug(`Got ${WsMessageTypeEnum.VERB_HOOK} event with message ID  ${session.msgid}`);
    });

    client.on(WsMessageTypeEnum.VERB_STATUS, (session: Session) => {
      logger.debug(`Got ${WsMessageTypeEnum.VERB_STATUS} event with message ID  ${session.msgid}`);
    });

    client.on(WsMessageTypeEnum.JAMBONZ_ERROR, (session: Session) => {
      logger.debug(`Got ${WsMessageTypeEnum.JAMBONZ_ERROR} event with message ID ${session.msgid}`);
    });
  }

  private handleDtmf(session: Session, event: WsDtmfEvent): void {
    WsIvrService.handleDtmf({ session, event });
  }

  private handleAmd(session: Session, event: WsAmdEvent): void {
    WsIvrService.handleAmd({ session, event });
  }

  private onClose(session: Session): void {
    const callDetails = session.customerData;
    logger.info({
      message: `Session ${session.call_id} closed`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        number_from: callDetails.numberFrom,
        call_id: session.call_id,
      },
    });
  }

  private onError(session: Session, err: Error): void {
    const callDetails = session.customerData;
    logger.info({
      message: `Session ${session.call_id} received error: ${err}`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        number_from: callDetails.numberFrom,
        call_id: session.call_id,
      },
    });
  }
}
