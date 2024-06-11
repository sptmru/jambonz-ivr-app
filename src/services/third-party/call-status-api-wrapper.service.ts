import axios from 'axios';
import { config } from '../../infrastructure/config/config';
import { CallStatusApiPayload } from '../../domain/types/call-status-api/dtmfpayload.type';
import { logger } from '../../misc/Logger';

export class CallStatusApiWrapper {
  public static baseUrl = config.thirdParty.callStatusApi.baseUrl;

  static async sendTransactionData(payload: CallStatusApiPayload): Promise<void> {
    try {
      const response = await axios.post(`${CallStatusApiWrapper.baseUrl}/dtmf`, payload);
      logger.info({
        message: `Transaction ${payload.transactionid} status (${payload.disposition}) sent to call status API: API answered with status ${response.status} (${response.statusText})`,
        labels: {
          job: config.loki.labels.job,
          transaction_id: payload.transactionid,
          number_to: payload.to,
        },
      });
    } catch (err) {
      logger.error({
        message: `Transaction ${payload.transactionid} data sending to call status API failed: ${err.message}`,
        labels: {
          job: config.loki.labels.job,
          transaction_id: payload.transactionid,
          number_to: payload.to,
        },
      });
    }
  }
}
