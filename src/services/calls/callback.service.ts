import { WebhookResponse } from '@jambonz/node-client';
import { logger } from '../../misc/Logger';
import { AmdResult, AmdResultEnum } from '../../domain/types/amdresult.type';
import { config } from '../../infrastructure/config/config';
import { DtmfResult } from '../../domain/types/dtmfresult.type';

export class CallbacksService {
  static ivrCallback(): WebhookResponse {
    logger.debug(`Handling an IVR callback`);
    const jambonz = new WebhookResponse();
    return jambonz.pause({ length: 1 }).gather({
      actionHook: `${config.jambonz.callbackBaseUrl}/api/v1/dtmf-callback`,
      input: ['digits'],
      maxDigits: 1,
      numDigits: 1,
      play: {
        url: 'https://ivr-app.sptm.space/sounds/demo-thanks.wav',
      },
    });
  }

  static dtmfCallback(result: DtmfResult): WebhookResponse {
    logger.debug(`Got DTMF`, result);
  }

  static amdCallback(result: AmdResult): WebhookResponse {
    logger.debug('Got AMD result:', result);
    const jambonz = new WebhookResponse();
    if (result.type !== AmdResultEnum.HUMAN) {
      return jambonz.hangup();
    }
  }
}
