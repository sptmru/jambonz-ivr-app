import { RedisFunctions, RedisModules, RedisScripts, createClient, RedisClientType } from 'redis';
import { config } from '../config/config';
import { logger } from '../../misc/Logger';
import { CallDetails } from '../../domain/types/calldetails.type';

interface RedisConnectionObserver {
  onRedisConnected: () => void;
  onRedisDisconnected: () => void;
}

export class RedisClient {
  private static instance: RedisClient | null = null;
  private connection: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
  private observers: RedisConnectionObserver[] = [];
  public isConnected: boolean = false;

  private constructor() {
    this.connection = createClient({ url: config.redis.uri });

    this.connection.on('connect', () => {
      logger.info('Redis connection (re)established');
      this.isConnected = true;
      this.observers.forEach(observer => observer.onRedisConnected());
    });

    this.connection.on('error', err => {
      logger.error('Redis connection error', err);
      this.isConnected = false;
      this.observers.forEach(observer => observer.onRedisDisconnected());
    });

    this.connection.on('end', () => {
      logger.info('Redis connection closed');
      this.isConnected = false;
      this.observers.forEach(observer => observer.onRedisDisconnected());
    });

    void this.connection.connect();
  }

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public addObserver(observer: RedisConnectionObserver): void {
    this.observers.push(observer);
  }

  async saveCallDetails(callId: string, details: CallDetails): Promise<void> {
    logger.info({
      message: `Saving call details for call ID ${callId}`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: details.transactionId,
        number_to: details.numberTo,
        call_id: callId,
      },
    });
    await this.connection.set(callId, JSON.stringify(details));
  }

  async deleteCallDetails(callId: string): Promise<void> {
    logger.info({
      message: `Deleting call details for call ID ${callId}`,
      labels: {
        job: config.loki.labels.job,
        call_id: callId,
      },
    });
    await this.connection.del(callId);
  }

  async updateCallDetails(callId: string): Promise<void> {
    logger.info({
      message: `Updating call details for call ID ${callId}`,
      labels: {
        job: config.loki.labels.job,
        call_id: callId,
      },
    });
    try {
      const existingDetails = await this.getCallObject(callId);
      const updatedDetails = { ...existingDetails, amdProcessed: true };
      await this.saveCallDetails(callId, updatedDetails as CallDetails);
    } catch (err) {
      logger.error('Error updating call details', err);
    }
  }

  async getCallObject(callId: string): Promise<CallDetails | null> {
    logger.info({
      message: `Retrieving call details for call ID ${callId}`,
      labels: {
        job: config.loki.labels.job,
        call_id: callId,
      },
    });
    try {
      const data = await this.connection.get(callId);
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}
