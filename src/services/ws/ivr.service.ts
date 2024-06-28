import { Session } from '@jambonz/node-client-ws';

import { config } from '../../infrastructure/config/config';
import { logger } from '../../misc/Logger';
import { WsDtmfEvent } from '../../domain/types/ws/events/dtmfevent.type';
import { CallStatusApiWrapper } from '../third-party/call-status-api-wrapper.service';
import { CallStatusApiDispositionEnum } from '../../domain/types/call-status-api/dtmfpayload.type';
import { WsData } from '../../domain/types/ws/wsdata.type';
import { WsAmdEvent } from '../../domain/types/ws/events/amdevent.type';
import { isBeep } from '../../domain/types/amdresult.type';
import { PhoneNumberValidatorService } from '../calls/phonenumbervalidator.service';
import { CallsService } from '../calls/calls.service';
import { CallDetails } from '../../domain/types/calldetails.type';

export class WsIvrService {
  static handleNewSession(wsData: WsData): void {
    const { session } = wsData;
    const callDetails = this.getCallDetails({ session });

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
    const callDetails = this.getCallDetails({ session });
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

  static ivrContinue(wsData: WsData & { event: WsDtmfEvent }): void {
    const { session } = wsData;
    const callDetails = this.getCallDetails({ session, dtmfEvent: wsData.event });

    const validatedInitialDestination = PhoneNumberValidatorService.validatePhoneNumber(callDetails.numberTo);
    const validatedInitialCallerId = PhoneNumberValidatorService.validatePhoneNumber(callDetails.numberFrom);

    // eslint-disable-next-line no-nested-ternary
    const callerId = validatedInitialDestination
      ? validatedInitialDestination.number
      : validatedInitialCallerId
        ? validatedInitialCallerId.number
        : undefined;

    const dialTarget = CallsService.prepareCallDestination(callDetails.destinationAddress, callDetails, true);

    session
      .play({ url: `${config.jambonz.audioCache.prefix}${callDetails.wavUrlContinue}` })
      .dial({
        target: [dialTarget],
        callerId,
      })
      .send();

    logger.info({
      message: `Continue IVR on call ID ${session.call_id}: transfer to ${callDetails.destinationAddress}`,
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
  }

  static ivrOptOut(wsData: WsData & { event: WsDtmfEvent }): void {
    const { session, event } = wsData;
    const callDetails = this.getCallDetails({ session, dtmfEvent: event });

    session
      .play({ url: `${config.jambonz.audioCache.prefix}${callDetails.wavUrlOptOut}` })
      .hangup()
      .send();

    logger.info({
      message: `Caller opted out on call ID ${event.call_id} using digit ${event.digits}`,
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
  }

  static ivrHangup(wsData: WsData & { event: WsDtmfEvent }): void {
    const { session, event } = wsData;
    const callDetails = this.getCallDetails({ session, dtmfEvent: event });

    session.hangup().send();

    logger.info({
      message:
        event.digits === undefined
          ? `Call ID ${event.call_id} hangup due to DTMF timeout`
          : `Call ID ${event.call_id} hangup due to invalid DTMF value: ${event.digits}`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        number_from: callDetails.numberFrom,
        call_id: event.call_id,
      },
    });

    void CallStatusApiWrapper.sendTransactionData({
      transactionid: callDetails.transactionId,
      from: event.from,
      to: event.to,
      disposition: CallStatusApiDispositionEnum.NOVMNOINPUT,
    });
  }

  static handleDtmf(wsData: WsData & { event: WsDtmfEvent }): void {
    const { session, event } = wsData;
    const callDetails = this.getCallDetails({ session, dtmfEvent: event });

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
        this.ivrContinue(wsData);
        break;
      case callDetails.digitOptOut:
        this.ivrOptOut(wsData);
        break;
      default:
        if (event.digits === undefined) {
          WsIvrService.ivrHangup(wsData);
        } else {
          WsIvrService.gatherDtmf(wsData);
        }
    }
  }

  static handleAmd(wsData: WsData & { event: WsAmdEvent }): void {
    const { event, session } = wsData;
    const callDetails = this.getCallDetails({ session, amdEvent: event });

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

  private static getCallDetails(data: {
    session: Session;
    amdEvent?: WsAmdEvent;
    dtmfEvent?: WsDtmfEvent;
  }): CallDetails {
    const { session, amdEvent, dtmfEvent } = data;
    if (amdEvent?.customerData) {
      return amdEvent.customerData;
    }
    if (dtmfEvent?.customerData) {
      return dtmfEvent.customerData;
    }
    return session.customerData;
  }
}
