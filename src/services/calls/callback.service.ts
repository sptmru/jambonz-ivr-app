import { WebhookResponse } from '@jambonz/node-client';
import { logger } from '../../misc/Logger';
import { AmdResult, AmdResultEnum } from '../../domain/types/amdresult.type';
import { config } from '../../infrastructure/config/config';
import { DtmfResult } from '../../domain/types/dtmfresult.type';
import { RedisClient } from '../../infrastructure/redis/client';
import { IvrInitiateResult } from '../../domain/types/ivrinitiateresult.type';

export class CallbacksService {
  static async ivrInitiateCallback(result: IvrInitiateResult): Promise<WebhookResponse> {
    logger.debug(`Handling an IVR callback`);
    const callDetails = await RedisClient.getInstance().getCallObject(result.call_sid);

    const jambonz = new WebhookResponse();
    return jambonz.pause({ length: 1 }).gather({
      actionHook: `${config.jambonz.callbackBaseUrl}/api/v1/dtmf-callback`,
      input: ['digits'],
      maxDigits: 1,
      numDigits: 1,
      play: {
        url: callDetails?.wavUrlAnnounce,
      },
    });
  }

  static async dtmfCallback(result: DtmfResult): Promise<WebhookResponse> {
    logger.debug(`Got DTMF`, result);
    const callDetails = await RedisClient.getInstance().getCallObject(result.call_sid);
    const jambonz = new WebhookResponse();

    if (result.digits === callDetails?.digitContinue) {
      return jambonz.say({ text: 'We should continue!' });
    }

    if (result.digits === callDetails?.digitOptOut) {
      return jambonz.say({ text: 'We should opt out!' });
    }

    return jambonz.say({ text: 'No available options with this digit!' });
  }

  static amdCallback(result: AmdResult): WebhookResponse {
    logger.debug('Got AMD result:', result);
    const jambonz = new WebhookResponse();
    if (result.type !== AmdResultEnum.HUMAN) {
      return jambonz.hangup();
    }
  }
}
