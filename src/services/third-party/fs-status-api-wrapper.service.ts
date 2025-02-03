import axios from 'axios';
import { config } from '../../infrastructure/config/config';
import { logger } from '../../misc/Logger';

export class FSStatusApiWrapper {
  private static baseUrl = config.thirdParty.fsStatusApi.baseUrl;

  private static cachedResult: boolean | null = null;
  private static lastFetchedTime: number = 0;
  private static cacheDuration: number = config.thirdParty.fsStatusApi.cacheTTL;

  static async checkIfWeCanProcessNewCalls(): Promise<boolean> {
    const currentTime = Date.now();
    if (
      this.cacheDuration !== 0 &&
      this.cachedResult !== null &&
      currentTime - this.lastFetchedTime < this.cacheDuration
    ) {
      return this.cachedResult;
    }

    try {
      const response = await axios.get(`${FSStatusApiWrapper.baseUrl}/instanceCalls/totalcalls`, {
        headers: {
          Authorization: `Bearer ${config.thirdParty.fsStatusApi.bearerToken}`,
        },
      });
      this.cachedResult = response.data.totalCalls < config.calls.expectedNumberOfCalls;
      this.lastFetchedTime = currentTime;

      return this.cachedResult;
    } catch (err) {
      logger.error(`Error while getting number of calls from FSStatus API: ${err.message}`);
      return false;
    }
  }
}
