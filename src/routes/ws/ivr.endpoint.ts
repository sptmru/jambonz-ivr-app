import { Client, Session } from '@jambonz/node-client-ws';

import { logger } from '../../misc/Logger';
import { WsMessageTypeEnum } from '../../domain/types/ws/base/messagetype.enum';
import { WsIvrService } from '../../services/ws/ivr.service';
import { WsDtmfEvent } from '../../domain/types/ws/events/dtmfevent.type';
import { config } from '../../infrastructure/config/config';
import { WsData } from '../../domain/types/ws/wsdata.type';

export class WsIvrEndpoint {
  constructor(initService: (params: { path: string }) => Client) {
    const client = initService({ path: `${config.ws.uri}/${config.ws.ivrEndpoint}` });

    client.on(WsMessageTypeEnum.SESSION_NEW, (session: Session) => {
      session
        .on('close', this.onClose.bind(null, session))
        .on('error', this.onError.bind(null, session))
        .on('/dtmf', this.handleDtmf.bind(null, session))
        .on('/amd', this.handleAmd.bind(null, session));
      WsIvrService.handleNewSession({ client, session });
    });

    client.on(WsMessageTypeEnum.VERB_HOOK, (session: Session) => {
      logger.info(`Got verb:hook from call ID ${session.call_sid}`);
    });
  }

  private handleDtmf(wsData: WsData & { event: WsDtmfEvent }): void {
    WsIvrService.handleDtmf(wsData);
  }

  private handleAmd(wsData: WsData & { event: WsDtmfEvent }): void {
    // TODO: change event type to WsAmdEvent
    WsIvrService.handleAmd(wsData);
  }

  private onClose(session: Session): void {
    logger.info(`Session ${session.call_sid} closed`);
  }

  private onError(session: Session, err: Error): void {
    logger.info(`Session ${session.call_sid} received error: ${err}`);
  }
}
