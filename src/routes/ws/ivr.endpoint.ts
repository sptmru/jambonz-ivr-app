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
