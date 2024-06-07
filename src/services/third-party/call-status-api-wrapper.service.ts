import axios from 'axios';
import { config } from '../../infrastructure/config/config';
import { CallStatusApiPayload } from '../../domain/types/call-status-api/dtmfpayload.type';
import { logger } from '../../misc/Logger';

export class CallStatusApiWrapper {
  public static baseUrl = config.thirdParty.callStatusApi.baseUrl;

  static async sendTransactionData(payload: CallStatusApiPayload): Promise<void> {
    try {
      const response = await axios.post(`${CallStatusApiWrapper.baseUrl}/dtmf`, payload);
      logger.info(
        `Transaction ${payload.transactionid} status (${payload.disposition}) sent to call status API: API answered with status ${response.status} (${response.statusText})`
      );
    } catch (err) {
      logger.error(`Transaction ${payload.transactionid} data sending to call status API failed: ${err.message}`);
    }
  }
}
