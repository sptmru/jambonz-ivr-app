import axios from "axios";
import { config } from "../../infrastructure/config/config";
import { logger } from "../../misc/Logger";

export class FSStatusApiWrapper {
  public static baseUrl  = config.thirdParty.fsStatusApi.baseUrl;

  static async checkIfWeCanProcessNewCalls(): Promise<boolean> {
    try {
      const response = await axios.get(`${FSStatusApiWrapper.baseUrl}/instanceCalls/totalcalls`, {
        headers: { 
          Authorization: `Bearer ${config.thirdParty.fsStatusApi.bearerToken}`,
        },
      });
      logger.info(`Number of calls from FSStatus API: ${response.data.totalCalls}`);
      return response.data.totalCalls < config.calls.expectedNumberOfCalls;
    } catch (err) {
      logger.error(`Error while getting number of calls from FSStatus API: ${err.message}`);
      return false;
    }
  }
}