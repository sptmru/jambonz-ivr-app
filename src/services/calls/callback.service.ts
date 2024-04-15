import { WebhookResponse } from '@jambonz/node-client';
import { logger } from '../../misc/Logger';
import { AmdResult, isAmdFinalEvent, isAmdMachine } from '../../domain/types/amdresult.type';
import { config } from '../../infrastructure/config/config';
import { DtmfResult } from '../../domain/types/dtmfresult.type';
import { RedisClient } from '../../infrastructure/redis/client';
import { IvrInitiateResult } from '../../domain/types/ivrinitiateresult.type';
import { VoslogicApiWrapper } from '../third-party/voslogic-api-wrapper.service';
import { VoslogicApiDispositionEnum } from '../../domain/types/voslogic/dtmfpayload.type';
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
    const dialTarget = CallsService.prepareCallDestination(callDetails.destinationAddress, callDetails);
    return new WebhookResponse().play({ url: callDetails.wavUrlContinue }).dial({
      target: [dialTarget],
      callerId,
    });
  }

  private static async ivrOptOut(result: DtmfResult, callDetails: CallDetails): Promise<WebhookResponse> {
    logger.info(`Caller opted out on call ID ${result.call_sid} using digit ${result.digits}`);
    await VoslogicApiWrapper.sendTransactionData({
      transactionid: result.call_sid,
      from: callDetails.numberFrom as string,
      to: callDetails.numberTo as string,
      Disposition: VoslogicApiDispositionEnum.OPTOUT,
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

    if (!isAmdMachine(result.type)) {
      logger.info(`AMD result on call ID ${result.call_sid} is not a machine, getting out of the AMD handler`);
      return new WebhookResponse();
    }

    logger.info(
      `AMD detected on call ID ${result.call_sid}, playing VM message and hanging up (URL: ${callDetails.wavUrlVM})`
    );
    await VoslogicApiWrapper.sendTransactionData({
      transactionid: result.call_sid,
      from: callDetails.numberFrom as string,
      to: callDetails.numberTo as string,
      Disposition: VoslogicApiDispositionEnum.VM,
    });
    return new WebhookResponse().play({ url: callDetails.wavUrlVM }).hangup();
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
