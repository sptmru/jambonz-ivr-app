/* eslint-disable @typescript-eslint/no-explicit-any */

import { config } from '../../infrastructure/config/config';
import { logger } from '../../misc/Logger';

export class WsIvrService {
  static handleNewSession(session: any): void {
    session.on('close', WsIvrService.onClose.bind(null, session)).on('error', WsIvrService.onError.bind(null, session));
    logger.info(`Starting IVR on call ID ${session.call_sid} from ${session.data.from} to ${session.data.to})`);
    session
      .gather({
        actionHook: config.ws.endpoint,
        input: ['digits'],
        maxDigits: 1,
        numDigits: 1,
        timeout: config.calls.dtmfGatherTimeout,
        play: {
          url: `${config.jambonz.audioCache.prefix}${session.customerData.wavUrlAnnounce}`,
        },
      })
      .send();
  }

  private static onClose(session: any): void {
    logger.info(`Session ${session.call_sid} closed`);
  }

  private static onError(session: any, err: Error): void {
    logger.info(`Session ${session.call_sid} received error: ${err}`);
  }
}
