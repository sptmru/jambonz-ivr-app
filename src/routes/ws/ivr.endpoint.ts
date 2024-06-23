import { Client, Session } from '@jambonz/node-client-ws';

import { logger } from '../../misc/Logger';
import { WsMessageTypeEnum } from '../../domain/types/ws/base/messagetype.enum';
import { WsIvrService } from '../../services/ws/ivr.service';
import { WsDtmfEvent } from '../../domain/types/ws/events/dtmfevent.type';

export class WsIvrEndpoint {
  constructor(initService: (params: { path: string }) => Client) {
    const svc = initService({ path: '/ws/call' });
    svc.on(WsMessageTypeEnum.SESSION_NEW, (session: Session) => {
      session
        .on('close', this.onClose.bind(null, session))
        .on('error', this.onError.bind(null, session))
        .on('/dtmf', this.handleDtmf.bind(null, session));
      WsIvrService.handleNewSession(session);
    });
  }

  private handleDtmf(session: Session, event: WsDtmfEvent): void {
    WsIvrService.handleDtmf(session, event);
  }

  private onClose(session: Session): void {
    logger.info(`Session ${session.call_sid} closed`);
  }

  private onError(session: Session, err: Error): void {
    logger.info(`Session ${session.call_sid} received error: ${err}`);
  }
}
