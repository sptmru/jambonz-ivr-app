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
import { IvrInitiateResult } from '../../domain/types/ivrinitiateresult.type';
import { CallStatusApiWrapper } from '../third-party/call-status-api-wrapper.service';
import { CallStatusApiDispositionEnum } from '../../domain/types/call-status-api/dtmfpayload.type';
import { CallStatus } from '../../domain/types/callstatus.type';
import { PhoneNumberValidatorService } from './phonenumbervalidator.service';
import { CallsService } from './calls.service';

export class CallbacksService {
  static ivrInitiateCallback(result: IvrInitiateResult): WebhookResponse {
    const callDetails = result.customerData;
    logger.info({
      message: `Starting IVR on call ID ${result.call_sid} from ${result.from} to ${result.to})`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        call_id: result.call_sid,
      },
    });

    const jambonz = new WebhookResponse();
    return jambonz.pause({ length: 2 }).gather({
      actionHook: `${config.jambonz.callbackBaseUrl}/api/v1/dtmf-callback`,
      input: ['digits'],
      maxDigits: 1,
      numDigits: 1,
      timeout: config.calls.dtmfGatherTimeout,
      play: {
        url: `${config.jambonz.audioCache.prefix}${callDetails.wavUrlAnnounce}`,
      },
    });
  }

  private static ivrContinue(result: DtmfResult): WebhookResponse {
    const callDetails = result.customerData;
    logger.info({
      message: `Continuing the call ${result.call_sid} to ${callDetails.destinationAddress}`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        call_id: result.call_sid,
      },
    });

    void CallStatusApiWrapper.sendTransactionData({
      transactionid: callDetails.transactionId,
      from: callDetails.numberFrom as string,
      to: callDetails.numberTo as string,
      disposition: CallStatusApiDispositionEnum.CONTINUE,
    });
    logger.info({
      message: `Transfer call ID ${result.call_sid} to ${callDetails.destinationAddress} via ${callDetails.carrierAddress}`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        call_id: result.call_sid,
      },
    });
    const validatedInitialDestination = PhoneNumberValidatorService.validatePhoneNumber(callDetails.numberTo);
    const validatedInitialCallerId = PhoneNumberValidatorService.validatePhoneNumber(callDetails.numberFrom);

    // eslint-disable-next-line no-nested-ternary
    const callerId = validatedInitialDestination
      ? validatedInitialDestination.number
      : validatedInitialCallerId
        ? validatedInitialCallerId.number
        : undefined;
    const dialTarget = CallsService.prepareCallDestination(callDetails.destinationAddress, callDetails, true);
    return new WebhookResponse()
      .play({ url: `${config.jambonz.audioCache.prefix}${callDetails.wavUrlContinue}` })
      .dial({
        target: [dialTarget],
        callerId,
      });
  }

  private static ivrOptOut(result: DtmfResult): WebhookResponse {
    const callDetails = result.customerData;
    logger.info({
      message: `Caller opted out on call ID ${result.call_sid} using digit ${result.digits}`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        call_id: result.call_sid,
      },
    });
    void CallStatusApiWrapper.sendTransactionData({
      transactionid: callDetails.transactionId,
      from: callDetails.numberFrom as string,
      to: callDetails.numberTo as string,
      disposition: CallStatusApiDispositionEnum.OPTOUT,
    });

    return new WebhookResponse()
      .play({ url: `${config.jambonz.audioCache.prefix}${callDetails.wavUrlOptOut}` })
      .hangup();
  }

  private static ivrHangup(result: DtmfResult): WebhookResponse {
    const callDetails = result.customerData;
    logger.info({
      message:
        result.digits === undefined
          ? `Call ID ${result.call_sid} hangup due to DTMF timeout`
          : `Call ID ${result.call_sid} hangup due to invalid DTMF value: ${result.digits}`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        call_id: result.call_sid,
      },
    });

    void CallStatusApiWrapper.sendTransactionData({
      transactionid: callDetails.transactionId,
      from: callDetails.numberFrom as string,
      to: callDetails.numberTo as string,
      disposition: CallStatusApiDispositionEnum.NOVMNOINPUT,
    });

    return new WebhookResponse().hangup();
  }

  static dtmfCallback(result: DtmfResult): WebhookResponse {
    logger.debug(`DTMF callback received`);
    logger.debug(`Transaction ID is ${result.customerData.transactionId}`);
    const callDetails = result.customerData;

    logger.info({
      message:
        result.digits === undefined
          ? `DTMF timeout on call ID ${result.call_sid} from ${result.from} to ${result.to}`
          : `DTMF received on call ID ${result.call_sid} from ${result.from} to ${result.to} : ${result.digits})`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        call_id: result.call_sid,
      },
    });

    switch (result.digits) {
      case callDetails.digitContinue:
        return CallbacksService.ivrContinue(result);

      case callDetails.digitOptOut:
        return CallbacksService.ivrOptOut(result);

      default:
        if (result.digits === undefined) {
          return CallbacksService.ivrHangup(result);
        }
        return new WebhookResponse().gather({
          actionHook: `${config.jambonz.callbackBaseUrl}/api/v1/dtmf-callback`,
          input: ['digits'],
          maxDigits: 1,
          numDigits: 1,
          timeout: config.calls.dtmfGatherTimeout,
          play: {
            url: `${config.jambonz.audioCache.prefix}${callDetails.wavUrlAnnounce}`,
          },
        });
    }
  }

  static amdCallback(result: AmdResult): WebhookResponse {
    const callDetails = result.customerData;

    logger.info({
      message: `AMD on call ID ${result.call_sid} from ${result.from} to ${result.to} : ${result.type})`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        call_id: result.call_sid,
      },
    });

    if (isAmdFinalEvent(result.type)) {
      // ignore final events
      return;
    }

    if (isAmdHuman(result.type)) {
      logger.info({
        message: `AMD on call ${result.call_sid}: human detected`,
        labels: {
          job: config.loki.labels.job,
          transaction_id: callDetails.transactionId,
          number_to: callDetails.numberTo,
          call_id: result.call_sid,
        },
      });
      return;
    }

    if (isBeep(result.type)) {
      const webhookResponse = new WebhookResponse()
        .play({ url: `${config.jambonz.audioCache.prefix}${callDetails.wavUrlVM}` })
        .hangup();

      void CallStatusApiWrapper.sendTransactionData({
        transactionid: callDetails.transactionId,
        from: callDetails.numberFrom as string,
        to: callDetails.numberTo as string,
        disposition: CallStatusApiDispositionEnum.VM,
      });

      return webhookResponse;
    }

    if (machineStoppedSpeaking(result.type)) {
      logger.info({
        message: `AMD on call ${result.call_sid}: machine stopped speaking`,
        labels: {
          job: config.loki.labels.job,
          transaction_id: callDetails.transactionId,
          number_to: callDetails.numberTo,
          call_id: result.call_sid,
        },
      });
      return;
    }
  }

  static statusCallback(result: CallStatus): void {
    logger.info({
      message: `Status on call ID ${result.call_id} from ${result.from} to ${result.to} — status: ${result.call_status} (code ${result.sip_status})`,
      labels: {
        job: config.loki.labels.job,
        number_to: result.to,
        number_from: result.from,
        call_id: result.call_id,
      },
    });

    if (result.call_status === 'busy' || result.call_status === 'failed') {
      const callDetails = result.customerData;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (callDetails?.transactionId) {
        void CallStatusApiWrapper.sendTransactionData({
          transactionid: callDetails.transactionId,
          from: callDetails.numberFrom as string,
          to: callDetails.numberTo as string,
          disposition:
            result.call_status === 'busy'
              ? CallStatusApiDispositionEnum.USER_BUSY
              : CallStatusApiDispositionEnum.NO_ANSWER,
        });
      }
    }
  }
}
