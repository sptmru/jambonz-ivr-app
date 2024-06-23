import { Session } from '@jambonz/node-client-ws';

import { config } from '../../infrastructure/config/config';
import { logger } from '../../misc/Logger';
import { WsDtmfEvent } from '../../domain/types/ws/events/dtmfevent.type';

export class WsIvrService {
  static handleNewSession(session: Session): void {
    logger.info(`Starting IVR on call ID ${session.call_sid} from ${session.data.from} to ${session.data.to})`);
    logger.debug(`The WS endpoint is ${config.ws.endpoint}`);

    session
      .gather({
        actionHook: '/dtmf',
        input: ['digits'],
        maxDigits: 1,
        numDigits: 1,
        timeout: config.calls.dtmfGatherTimeout,
        play: {
          url: `${config.jambonz.audioCache.prefix}${session.customerData.wavUrlAnnounce}`,
        },
      })
      .send({ reply: true });
  }

  static handleDtmf(session: Session, event: WsDtmfEvent): void {
    logger.info(`Received DTMF ${event.digits} from call ID ${session.call_sid}`);
    session.send({ digits: event.digits });
  }
}
