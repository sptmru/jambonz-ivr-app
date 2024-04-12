import { WebhookResponse } from '@jambonz/node-client';
import { logger } from '../../misc/Logger';
import { AmdResult, AmdResultEnum } from '../../domain/types/amdresult.type';
import { config } from '../../infrastructure/config/config';
import { DtmfResult } from '../../domain/types/dtmfresult.type';
import { RedisClient } from '../../infrastructure/redis/client';
import { IvrInitiateResult } from '../../domain/types/ivrinitiateresult.type';
import { VoslogicApiWrapper } from '../third-party/voslogic-api-wrapper.service';
import { VoslogicApiDispositionEnum } from '../../domain/types/voslogic/dtmfpayload.type';
import { CallStatus } from '../../domain/types/callstatus.type';
import { MQClient } from '../../infrastructure/rabbitmq/client';
import { PhoneNumberValidatorService } from './phonenumbervalidator.service';

export class CallbacksService {
  static async ivrInitiateCallback(result: IvrInitiateResult): Promise<WebhookResponse> {
    const callDetails = await RedisClient.getInstance().getCallObject(result.call_sid);
    if (!callDetails) {
      logger.error(`Call ID ${result.call_sid} not found in Redis`);
      return new WebhookResponse().hangup();
    }
    logger.info(`Starting IVR on call ID ${result.call_sid} from ${result.from} to ${result.to})`);

    const jambonz = new WebhookResponse();
    return jambonz.pause({ length: 1 }).gather({
      actionHook: `${config.jambonz.callbackBaseUrl}/api/v1/dtmf-callback`,
      input: ['digits'],
      maxDigits: 1,
      numDigits: 1,
      timeout: config.calls.dtmfGatherTimeout,
      play: {
        url: callDetails.wavUrlAnnounce,
      },
    });
  }

  static async dtmfCallback(result: DtmfResult): Promise<WebhookResponse> {
    logger.info(
      result.digits === undefined
        ? `DTMF timeout on call ID ${result.call_sid} from ${result.from} to ${result.to}`
        : `DTMF received on call ID ${result.call_sid} from ${result.from} to ${result.to} : ${result.digits})`
    );
    const callDetails = await RedisClient.getInstance().getCallObject(result.call_sid);
    if (!callDetails) {
      logger.error(`Call ID ${result.call_sid} not found in Redis`);
      return new WebhookResponse().hangup();
    }
    const jambonz = new WebhookResponse();

    if (result.digits === callDetails.digitContinue) {
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
      const validatedInitialDestination = PhoneNumberValidatorService.validatePhoneNumber(callDetails.numberTo);
      const validatedInitialCallerId = PhoneNumberValidatorService.validatePhoneNumber(callDetails.numberFrom);

      // eslint-disable-next-line no-nested-ternary
      const callerId = validatedInitialDestination
        ? validatedInitialDestination.number
        : validatedInitialCallerId
          ? validatedInitialCallerId.number
          : undefined;
      const dialTarget = callDetails.destinationAddress.includes('@')
        ? { type: 'user', name: callDetails.destinationAddress }
        : { type: 'phone', number: callDetails.destinationAddress, trunk: callDetails.carrierAddress };
      return jambonz.play({ url: callDetails.wavUrlContinue }).dial({
        target: [dialTarget],
        callerId,
      });
    }

    if (result.digits === callDetails.digitOptOut) {
      logger.info(`Caller opted out on call ID ${result.call_sid} using digit ${result.digits}`);
      await VoslogicApiWrapper.sendTransactionData({
        transactionid: result.call_sid,
        from: callDetails.numberFrom as string,
        to: callDetails.numberTo as string,
        Disposition: VoslogicApiDispositionEnum.OPTOUT,
      });
      return jambonz.play({ url: callDetails.wavUrlOptOut });
    }
    logger.info(
      result.digits === undefined
        ? `Call ID ${result.call_sid} hangup due to DTMF timeout`
        : `Call ID ${result.call_sid} hangup due to invalid DTMF value: ${result.digits}`
    );
    return jambonz.hangup();
  }

  static async amdCallback(result: AmdResult): Promise<WebhookResponse> {
    logger.info(`AMD on call ID ${result.call_sid} from ${result.from} to ${result.to} : ${result.type})`);
    const callDetails = await RedisClient.getInstance().getCallObject(result.call_sid);
    if (!callDetails) {
      logger.error(`Call ID ${result.call_sid} not found in Redis`);
      return new WebhookResponse().hangup();
    }
    const jambonz = new WebhookResponse();
    if (result.type === AmdResultEnum.MACHINE) {
      await VoslogicApiWrapper.sendTransactionData({
        transactionid: result.call_sid,
        from: callDetails.numberFrom as string,
        to: callDetails.numberTo as string,
        Disposition: VoslogicApiDispositionEnum.VM,
      });
      return jambonz.play({ url: callDetails.wavUrlVM });
    }
  }

  static statusCallback(result: CallStatus): void {
    logger.info(
      `Status on call ID ${result.call_sid} from ${result.from} to ${result.to} — status: ${result.call_status} (code ${result.sip_status})`
    );
    const mq = MQClient.getInstance();
    void mq.publishToQueue(config.rabbitmq.callStatusQueue, result);
    if (result.call_status === 'completed') {
      void RedisClient.getInstance().deleteCallDetails(result.call_sid);
    }
  }
}
