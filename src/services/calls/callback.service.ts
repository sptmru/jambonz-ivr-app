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

export class CallbacksService {
  static ivrInitiateCallback(result: IvrInitiateResult): WebhookResponse {
    const callDetails = result.customerData;
    logger.info({
      message: `Starting voice gathering on call ID ${result.call_sid} from ${result.from} to ${result.to})`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        call_id: result.call_sid,
      },
    });

    const jambonz = new WebhookResponse();
    return jambonz.gather({
      actionHook: `${config.jambonz.callbackBaseUrl}/api/v1/dtmf-callback`,
      input: ['speech'],
      timeout: config.calls.dtmfGatherTimeout,
      play: {
        url: `${config.jambonz.audioCache.prefix}${callDetails.wavUrlAnnounce}`,
      },
    });
  }

  static dtmfCallback(result: DtmfResult): WebhookResponse {
    logger.info(`Got GATHER result: ${result.speech}`);
    logger.info(result);
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
        number_to: result.customerData.numberTo,
        number_from: result.customerData.numberFrom,
        call_id: result.call_id,
      },
    });

    if (result.call_status === 'busy' || result.call_status === 'failed') {
      const callDetails = result.customerData;

      void CallStatusApiWrapper.sendTransactionData({
        transactionid: callDetails.transactionId,
        from: result.customerData.numberFrom,
        to: result.customerData.numberTo,
        disposition:
          result.call_status === 'busy'
            ? CallStatusApiDispositionEnum.USER_BUSY
            : CallStatusApiDispositionEnum.NO_ANSWER,
      });
    }
  }
}
