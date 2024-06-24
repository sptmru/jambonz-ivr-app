import { config } from '../../infrastructure/config/config';
import { logger } from '../../misc/Logger';
import { WsDtmfEvent } from '../../domain/types/ws/events/dtmfevent.type';
import { CallStatusApiWrapper } from '../third-party/call-status-api-wrapper.service';
import { CallStatusApiDispositionEnum } from '../../domain/types/call-status-api/dtmfpayload.type';
import { WsData } from '../../domain/types/ws/wsdata.type';
import { WsAmdEvent } from '../../domain/types/ws/events/amdevent.type';
import { isBeep } from '../../domain/types/amdresult.type';

export class WsIvrService {
  static handleNewSession(wsData: WsData): void {
    const { session } = wsData;
    const callDetails = session.customerData;

    logger.info({
      message: `Starting IVR on call ID ${session.call_id})`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        number_from: callDetails.numberFrom,
        call_id: session.call_id,
      },
    });
    WsIvrService.gatherDtmf(wsData);
  }

  static gatherDtmf(wsData: WsData): void {
    const { session } = wsData;
    const callDetails = session.customerData;
    session
      .gather({
        actionHook: '/dtmf',
        input: ['digits'],
        dtmfBargein: true,
        listenDuringPrompt: true,
        maxDigits: 1,
        numDigits: 1,
        timeout: config.calls.dtmfGatherTimeout,
        play: {
          url: `${config.jambonz.audioCache.prefix}${session.customerData.wavUrlAnnounce}`,
        },
      })
      .send();

    logger.info({
      message: `Waiting for DTMF on call ID ${session.call_id}`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        number_from: callDetails.numberFrom,
        call_id: session.call_id,
      },
    });
  }

  static ivrContinue(wsData: WsData): void {
    const { session } = wsData;
    const callDetails = session.customerData;

    logger.info({
      message: `Transfer call ID ${session.call_id} to ${callDetails.destinationAddress}`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        number_from: callDetails.numberFrom,
        call_id: session.call_id,
      },
    });

    void CallStatusApiWrapper.sendTransactionData({
      transactionid: callDetails.transactionId,
      from: callDetails.numberFrom,
      to: callDetails.numberTo,
      disposition: CallStatusApiDispositionEnum.CONTINUE,
    });

    // TODO: transfer call to destination address
  }

  static ivrOptOut(wsData: WsData): void {
    const { session } = wsData;
    const callDetails = session.customerData;

    logger.info({
      message: `Call ID ${session.call_id} opted out from the IVR`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        number_from: callDetails.numberFrom,
        call_id: session.call_id,
      },
    });

    void CallStatusApiWrapper.sendTransactionData({
      transactionid: callDetails.transactionId,
      from: callDetails.numberFrom,
      to: callDetails.numberTo,
      disposition: CallStatusApiDispositionEnum.OPTOUT,
    });

    // TODO: play opt out audio and hangup
  }

  static handleDtmf(wsData: WsData & { event: WsDtmfEvent }): void {
    const { session, event } = wsData;
    const callDetails = event.customerData;
    logger.info({
      message:
        event.digits === undefined
          ? `DTMF timeout on call ID ${event.call_id}`
          : `DTMF received on call ID ${event.call_id}: ${event.digits})`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        number_from: callDetails.numberFrom,
        call_id: session.call_id,
      },
    });

    switch (event.digits) {
      case callDetails.digitContinue:
        this.ivrContinue(session);
        break;
      case callDetails.digitOptOut:
        this.ivrOptOut(session);
        break;
      default:
        if (event.digits === undefined) {
          // hangup
        } else {
          WsIvrService.gatherDtmf(wsData);
        }
    }
  }

  static handleAmd(wsData: WsData & { event: WsAmdEvent }): void {
    const { event, session } = wsData;
    const callDetails = event.customerData;

    logger.info({
      message: `AMD on call ID ${event.call_id}: ${event.type})`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        number_from: callDetails.numberFrom,
        call_id: event.call_id,
      },
    });

    if (isBeep(event.type)) {
      session.play({ url: `${config.jambonz.audioCache.prefix}${callDetails.wavUrlVM}` }).send();

      void CallStatusApiWrapper.sendTransactionData({
        transactionid: callDetails.transactionId,
        from: callDetails.numberFrom,
        to: callDetails.numberTo,
        disposition: CallStatusApiDispositionEnum.VM,
      });
    }
  }
}
