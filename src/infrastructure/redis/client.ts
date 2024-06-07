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
    logger.info(`Saving call details for call ID ${callId}`);
    await this.connection.set(callId, JSON.stringify(details));
  }

  async deleteCallDetails(callId: string): Promise<void> {
    logger.info(`Deleting call details for call ID ${callId}`);
    await this.connection.del(callId);
  }

  async getCallObject(callId: string): Promise<CallDetails | null> {
    logger.info(`Retrieving call details for call ID ${callId}`);
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
