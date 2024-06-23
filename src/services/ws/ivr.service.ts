import { WebhookResponse } from '@jambonz/node-client';

import { config } from '../../infrastructure/config/config';
import { logger } from '../../misc/Logger';
import { WsDtmfEvent } from '../../domain/types/ws/events/dtmfevent.type';
import { CallStatusApiWrapper } from '../third-party/call-status-api-wrapper.service';
import { CallStatusApiDispositionEnum } from '../../domain/types/call-status-api/dtmfpayload.type';
import { WsData } from '../../domain/types/ws/wsdata.type';

export class WsIvrService {
  static handleNewSession(wsData: WsData): void {
    const { session } = wsData;
    logger.info(`Starting IVR on call ID ${session.call_sid} from ${session.data.from} to ${session.data.to})`);
    WsIvrService.gatherDtmf(wsData);
  }

  static gatherDtmf(wsData: WsData): void {
    const { client, session } = wsData;
    logger.info(`Waiting for DTMF on call ID ${session.call_sid}`);

    const response = new WebhookResponse();
    response.gather({
      actionHook: `${config.ws.uri}/${config.ws.ivrEndpoint}/dtmf`,
      input: ['digits'],
      maxDigits: 1,
      numDigits: 1,
      timeout: config.calls.dtmfGatherTimeout,
      play: {
        url: `${config.jambonz.audioCache.prefix}${session.customerData.wavUrlAnnounce}`,
      },
    });

    client.ack(session.msgid, response);
    // session.send({ reply: true });
  }

  static ivrContinue(wsData: WsData): void {
    const { session } = wsData;
    const callDetails = session.customerData;
    logger.info(`Transfer call ID ${session.call_sid} to ${callDetails.destinationAddress}`);

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
    logger.info(`Call ID ${session.call_sid} opted out from the IVR`);

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
          ? `DTMF timeout on call ID ${event.call_sid} from ${event.from} to ${event.to}`
          : `DTMF received on call ID ${event.call_sid} from ${event.from} to ${event.to} : ${event.digits})`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        call_id: session.call_sid,
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

  static handleAmd(wsData: WsData & { event: WsDtmfEvent }): void {
    // TODO: change event type to WsAmdEvent
    const { session, event } = wsData;
    logger.info(`AMD result on call ID ${session.call_sid}`);
    logger.debug(event.reason);
  }
}
