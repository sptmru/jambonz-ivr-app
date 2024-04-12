import axios from 'axios';
import { config } from '../../infrastructure/config/config';
import { VoslogicDtmfPayload } from '../../domain/types/voslogic/dtmfpayload.type';
import { logger } from '../../misc/Logger';

export class VoslogicApiWrapper {
  public static baseUrl = config.thirdParty.voslogic.apiBaseUrl;

  static async sendTransactionData(payload: VoslogicDtmfPayload): Promise<void> {
    try {
      const response = await axios.post(`${VoslogicApiWrapper.baseUrl}/dtmf`, payload);
      logger.info(
        `Transaction ${payload.transactionid} data sent to Voslogic API: API answered with status ${response.status} (${response.statusText})`
      );
    } catch (err) {
      logger.error(`Transaction ${payload.transactionid} data sending to Voslogic API failed: ${err.message}`);
    }
  }
}
