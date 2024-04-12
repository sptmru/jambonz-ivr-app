import { WebhookResponse } from '@jambonz/node-client';
import { logger } from '../../misc/Logger';
import { AmdResult, AmdResultEnum } from '../../domain/types/amdresult.type';
import { config } from '../../infrastructure/config/config';
import { DtmfResult } from '../../domain/types/dtmfresult.type';
import { RedisClient } from '../../infrastructure/redis/client';
import { IvrInitiateResult } from '../../domain/types/ivrinitiateresult.type';
import { VoslogicApiWrapper } from '../third-party/voslogic-api-wrapper.service';
import { VoslogicApiDispositionEnum } from '../../domain/types/voslogic/dtmfpayload.type';

export class CallbacksService {
  static async ivrInitiateCallback(result: IvrInitiateResult): Promise<WebhookResponse> {
    const callDetails = await RedisClient.getInstance().getCallObject(result.call_sid);
    logger.info(`Starting IVR on call ID ${result.call_sid} from ${result.from} to ${result.to})`);

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
    logger.info(`DTMF received on call ID ${result.call_sid} from ${result.from} to ${result.to} : ${result.digits})`);
    const callDetails = await RedisClient.getInstance().getCallObject(result.call_sid);
    const jambonz = new WebhookResponse();

    if (result.digits === callDetails?.digitContinue) {
      logger.info(`Continuing the call ${result.call_sid} to ${callDetails.destinationAddress}`);
      await VoslogicApiWrapper.sendTransactionData({
        transactionid: result.call_sid,
        from: callDetails.numberFrom as string,
        to: callDetails.numberTo as string,
        Disposition: VoslogicApiDispositionEnum.CONTINUE,
      });
      logger.info(
        `Transfer call ID ${result.call_sid} to ${callDetails.destinationAddress} via ${callDetails.carrierAddress}`
      );
      const dialTarget = callDetails.destinationAddress.includes('@')
        ? { type: 'user', name: callDetails.destinationAddress }
        : { type: 'phone', number: callDetails.destinationAddress, trunk: callDetails.carrierAddress };
      return jambonz
        .play({ url: callDetails.wavUrlContinue })
        .dial({ target: [dialTarget], callerId: callDetails.numberTo });
    }

    if (result.digits === callDetails?.digitOptOut) {
      logger.info(`Caller opted out on call ID ${result.call_sid} using digit ${result.digits}`);
      await VoslogicApiWrapper.sendTransactionData({
        transactionid: result.call_sid,
        from: callDetails.numberFrom as string,
        to: callDetails.numberTo as string,
        Disposition: VoslogicApiDispositionEnum.OPTOUT,
      });
      return jambonz.play({ url: callDetails.wavUrlOptOut });
    }
    logger.info(`Caller hangout on call ID ${result.call_sid} using digit ${result.digits}`);
    return jambonz.hangup();
  }

  static async amdCallback(result: AmdResult): Promise<WebhookResponse> {
    logger.info(`AMD on call ID ${result.call_sid} from ${result.from} to ${result.to} : ${result.type})`);
    const callDetails = await RedisClient.getInstance().getCallObject(result.call_sid);
    const jambonz = new WebhookResponse();
    if (result.type === AmdResultEnum.MACHINE) {
      await VoslogicApiWrapper.sendTransactionData({
        transactionid: result.call_sid,
        from: callDetails?.numberFrom as string,
        to: callDetails?.numberTo as string,
        Disposition: VoslogicApiDispositionEnum.VM,
      });
      return jambonz.play({ url: callDetails?.wavUrlVM });
    }
  }
}
