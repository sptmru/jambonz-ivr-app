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
      logger.debug(`Continuing the call ${result.call_sid} to ${callDetails.destinationAddress}`);
      const dialTarget = callDetails.destinationAddress.includes('@')
        ? { type: 'user', name: callDetails.destinationAddress }
        : { type: 'phone', number: callDetails.destinationAddress, trunk: callDetails.carrierAddress };
      return jambonz.play({ url: callDetails.wavUrlContinue }).dial({ target: [dialTarget] });
    }

    if (result.digits === callDetails?.digitOptOut) {
      logger.debug(`Caller opted out using digit ${result.digits} on call ${result.call_sid}`);
      return jambonz.play({ url: callDetails.wavUrlOptOut });
    }

    return jambonz.hangup();
  }

  static async amdCallback(result: AmdResult): Promise<WebhookResponse> {
    logger.debug('Got AMD result:', result);
    const callDetails = await RedisClient.getInstance().getCallObject(result.call_sid);
    const jambonz = new WebhookResponse();
    if (result.type !== AmdResultEnum.HUMAN) {
      return jambonz.play({ url: callDetails?.wavUrlVM });
    }
  }
}
