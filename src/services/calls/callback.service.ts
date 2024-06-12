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
      logger.error({
        message: `Call ID ${result.call_sid} not found in Redis`,
        labels: {
          job: config.loki.labels.job,
          number_to: result.to,
          call_id: result.call_sid,
        },
      });
      return new WebhookResponse().hangup();
    }
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

  private static ivrContinue(result: DtmfResult, callDetails: CallDetails): Promise<WebhookResponse> {
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
    const dialTarget = CallsService.prepareCallDestination(callDetails.destinationAddress, callDetails);
    return new WebhookResponse().play({ url: callDetails.wavUrlContinue }).dial({
      target: [dialTarget],
      callerId,
    });
  }

  private static ivrOptOut(result: DtmfResult, callDetails: CallDetails): Promise<WebhookResponse> {
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

    return new WebhookResponse().play({ url: callDetails.wavUrlOptOut }).hangup();
  }

  private static async ivrHangup(result: DtmfResult): Promise<WebhookResponse> {
    const callDetails = await RedisClient.getInstance().getCallObject(result.call_sid);
    if (callDetails !== null) {
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
        from: result.from,
        to: result.to,
        disposition: CallStatusApiDispositionEnum.NOVMNOINPUT,
      });
    }

    return new WebhookResponse().hangup();
  }

  static async dtmfCallback(result: DtmfResult): Promise<WebhookResponse> {
    const callDetails = await RedisClient.getInstance().getCallObject(result.call_sid);
    if (!callDetails) {
      logger.error({
        message: `Call ID ${result.call_sid} not found in Redis`,
        labels: {
          job: config.loki.labels.job,
          number_to: result.to,
          call_id: result.call_sid,
        },
      });
      return new WebhookResponse().hangup();
    }

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
        return CallbacksService.ivrContinue(result, callDetails);

      case callDetails.digitOptOut:
        return CallbacksService.ivrOptOut(result, callDetails);

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
            url: callDetails.wavUrlAnnounce,
          },
        });
    }
  }

  static async amdCallback(result: AmdResult): Promise<WebhookResponse> {
    const callDetails = await RedisClient.getInstance().getCallObject(result.call_sid);
    if (!callDetails) {
      logger.error({
        message: `Call ID ${result.call_sid} not found in Redis`,
        labels: {
          job: config.loki.labels.job,
          number_to: result.to,
          call_id: result.call_sid,
        },
      });
      return new WebhookResponse().hangup();
    }

    if (callDetails.amdProcessed === true) {
      logger.info({
        message: `AMD status on call ID was already processed`,
        labels: {
          job: config.loki.labels.job,
          transaction_id: callDetails.transactionId,
          number_to: callDetails.numberTo,
          call_id: result.call_sid,
        },
      });

      return;
    }

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
      const webhookResponse = new WebhookResponse().play({ url: callDetails.wavUrlVM }).hangup();

      void (async (): Promise<void> => {
        await RedisClient.getInstance().updateCallDetails(result.call_sid);
        logger.info({
          message: `AMD on call ${result.call_sid}: beep detected`,
          labels: {
            job: config.loki.labels.job,
            transaction_id: callDetails.transactionId,
            number_to: callDetails.numberTo,
            call_id: result.call_sid,
          },
        });
        logger.info({
          message: `Playing VM message on call ${result.call_sid} (URL: ${callDetails.wavUrlVM})`,
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
          disposition: CallStatusApiDispositionEnum.VM,
        });
      })();
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

  static async statusCallback(result: CallStatus): Promise<void> {
    logger.info({
      message: `Status on call ID ${result.call_sid} from ${result.from} to ${result.to} — status: ${result.call_status} (code ${result.sip_status})`,
      labels: {
        job: config.loki.labels.job,
        number_to: result.to,
        call_id: result.call_sid,
      },
    });

    if (result.call_status === 'busy' || result.call_status === 'failed') {
      const callDetails = await RedisClient.getInstance().getCallObject(result.call_sid);
      if (callDetails !== null) {
        void CallStatusApiWrapper.sendTransactionData({
          transactionid: callDetails.transactionId,
          from: result.from,
          to: result.to,
          disposition:
            result.call_status === 'busy'
              ? CallStatusApiDispositionEnum.USER_BUSY
              : CallStatusApiDispositionEnum.NO_ANSWER,
        });
      }
    }
    const mq = MQClient.getInstance();
    void mq.publishToQueue(config.rabbitmq.callStatusQueue, result);
  }
}
