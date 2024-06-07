import { WebhookResponse } from '@jambonz/node-client';
import { logger } from '../../misc/Logger';
import {
  AmdResult,
  isAmdFinalEvent,
  isAmdHuman,
  isBeep,
  machineStoppedSpeaking,
} from '../../domain/types/amdresult.type';
import { config } from '../../infrastructure/config/config';
import { DtmfResult } from '../../domain/types/dtmfresult.type';
import { RedisClient } from '../../infrastructure/redis/client';
import { IvrInitiateResult } from '../../domain/types/ivrinitiateresult.type';
import { CallStatusApiWrapper } from '../third-party/call-status-api-wrapper.service';
import { CallStatusApiDispositionEnum } from '../../domain/types/call-status-api/dtmfpayload.type';
import { CallStatus } from '../../domain/types/callstatus.type';
import { MQClient } from '../../infrastructure/rabbitmq/client';
import { PhoneNumberValidatorService } from './phonenumbervalidator.service';
import { CallDetails } from '../../domain/types/calldetails.type';
import { CallsService } from './calls.service';

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

  private static async ivrContinue(result: DtmfResult, callDetails: CallDetails): Promise<WebhookResponse> {
    logger.info(`Continuing the call ${result.call_sid} to ${callDetails.destinationAddress}`);
    await CallStatusApiWrapper.sendTransactionData({
      transactionid: result.call_sid,
      from: callDetails.numberFrom as string,
      to: callDetails.numberTo as string,
      Disposition: CallStatusApiDispositionEnum.CONTINUE,
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
    const dialTarget = CallsService.prepareCallDestination(callDetails.destinationAddress, callDetails);
    return new WebhookResponse().play({ url: callDetails.wavUrlContinue }).dial({
      target: [dialTarget],
      callerId,
    });
  }

  private static async ivrOptOut(result: DtmfResult, callDetails: CallDetails): Promise<WebhookResponse> {
    logger.info(`Caller opted out on call ID ${result.call_sid} using digit ${result.digits}`);
    await CallStatusApiWrapper.sendTransactionData({
      transactionid: result.call_sid,
      from: callDetails.numberFrom as string,
      to: callDetails.numberTo as string,
      Disposition: CallStatusApiDispositionEnum.OPTOUT,
    });

    return new WebhookResponse().play({ url: callDetails.wavUrlOptOut }).hangup();
  }

  private static ivrHangup(result: DtmfResult): Promise<WebhookResponse> {
    logger.info(
      result.digits === undefined
        ? `Call ID ${result.call_sid} hangup due to DTMF timeout`
        : `Call ID ${result.call_sid} hangup due to invalid DTMF value: ${result.digits}`
    );
    return new WebhookResponse().hangup();
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

    switch (result.digits) {
      case callDetails.digitContinue:
        return CallbacksService.ivrContinue(result, callDetails);

      case callDetails.digitOptOut:
        return CallbacksService.ivrOptOut(result, callDetails);

      default:
        return CallbacksService.ivrHangup(result);
    }
  }

  static async amdCallback(result: AmdResult): Promise<WebhookResponse> {
    logger.info(`AMD on call ID ${result.call_sid} from ${result.from} to ${result.to} : ${result.type})`);
    const callDetails = await RedisClient.getInstance().getCallObject(result.call_sid);
    if (!callDetails) {
      logger.error(`Call ID ${result.call_sid} not found in Redis`);
      return new WebhookResponse().hangup();
    }

    if (isAmdFinalEvent(result.type)) {
      // ignore final events
      return;
    }

    if (isAmdHuman(result.type)) {
      logger.info(`AMD on call ${result.call_sid}: human detected`);
      return;
    }

    if (isBeep(result.type)) {
      logger.info(`AMD on call ${result.call_sid}: beep detected`);
      logger.info(`Playing VM message on call ${result.call_sid} (URL: ${callDetails.wavUrlVM})`);

      await CallStatusApiWrapper.sendTransactionData({
        transactionid: result.call_sid,
        from: callDetails.numberFrom as string,
        to: callDetails.numberTo as string,
        Disposition: CallStatusApiDispositionEnum.VM,
      });
      return new WebhookResponse().play({ url: callDetails.wavUrlVM }).hangup();
    }

    if (machineStoppedSpeaking(result.type)) {
      logger.info(`AMD on call ${result.call_sid}: machine stopped speaking`);
      return;
    }
  }

  static statusCallback(result: CallStatus): void {
    logger.info(
      `Status on call ID ${result.call_sid} from ${result.from} to ${result.to} — status: ${result.call_status} (code ${result.sip_status})`
    );
    const mq = MQClient.getInstance();
    void mq.publishToQueue(config.rabbitmq.callStatusQueue, result);
    // if (result.call_status === 'completed') {
    //   void RedisClient.getInstance().deleteCallDetails(result.call_sid);
    // }
  }
}
