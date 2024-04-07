import { RedisFunctions, RedisModules, RedisScripts, createClient, RedisClientType } from 'redis';
import { config } from '../config/config';
import { logger } from '../../misc/Logger';
import { CallDetails } from '../../domain/types/calldetails.type';

export class RedisClient {
  private static instance: RedisClient | null = null;
  private connection: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

  private constructor() {
    this.connection = createClient({ url: config.redis.uri });

    this.connection.on('connect', () => {
      logger.debug('Redis connection (re)established');
    });

    this.connection.on('error', err => {
      logger.error('Redis connection error', err);
    });

    void this.connection.connect();
  }

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  async saveCallDetails(callId: string, details: CallDetails): Promise<void> {
    await this.connection.set(callId, JSON.stringify(details));
  }

  async getCallObject(callId: string): Promise<CallDetails | null> {
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
