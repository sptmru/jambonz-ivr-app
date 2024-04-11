import Connection, { Consumer } from 'rabbitmq-client';
import { config } from '../config/config';
import { logger } from '../../misc/Logger';
import { CallDetails } from '../../domain/types/calldetails.type';
import { RedisClient } from '../redis/client';

interface MessageHandler {
  (param1: CallDetails): Promise<void>;
}

export class MQClient {
  private connection: Connection;
  private sub: Consumer;
  private queueName: string;
  private messageHandler: MessageHandler;
  private isConsuming: boolean = false;
  private static instance: MQClient | null = null;

  constructor() {
    this.connect();
    RedisClient.getInstance().addObserver(this);
  }

  static getInstance(): MQClient {
    if (!MQClient.instance) {
      MQClient.instance = new MQClient();
    }
    return MQClient.instance;
  }

  private connect(): void {
    this.connection = new Connection(config.rabbitmq.uri);
    this.connection.on('error', err => {
      logger.error(`RabbitMQ connection error: ${err}`);
    });
    this.connection.on('connection', () => {
      logger.debug('RabbitMQ connection (re)established');
    });
  }

  onRedisConnected(): void {
    if (this.isConsuming) {
      logger.debug(`Already consuming from ${this.queueName}`);
      return;
    }
    logger.debug(`Redis connection is reestablished, resuming RabbitMQ message consumption`);
    this.consumeToQueue(this.queueName, this.messageHandler);
  }

  onRedisDisconnected(): void {
    if (!this.isConsuming) {
      logger.debug(`Not consuming from ${this.queueName}`);
      return;
    }
    logger.debug(`Redis connection is lost, stopping RabbitMQ message consumption`);
    void this.sub.close();
    this.isConsuming = false;
  }

  consumeToQueue(queueName: string, messageHandler: MessageHandler): void {
    this.queueName = queueName;
    this.messageHandler = messageHandler;

    if (this.isConsuming) {
      logger.warn(`Already consuming from ${this.queueName}`);
      return;
    }
    this.sub = this.connection.createConsumer(
      {
        queue: queueName,
        queueOptions: { durable: true },
        qos: { prefetchCount: config.rabbitmq.prefetchCount },
      },
      async msg => {
        try {
          const parsedMessage = JSON.parse(msg.body);
          logger.debug(`Received a message from ${queueName}: ${JSON.stringify(parsedMessage)}`);

          await messageHandler(parsedMessage);
        } catch (err) {
          logger.error(`Consumer error on queue ${queueName}: ${err}`);
        }
        return;
      }
    );
    this.isConsuming = true;

    this.sub.on('error', err => {
      logger.error(`Consumer error on queue ${queueName}: ${err}`);
    });
  }

  async onShutdown(): Promise<void> {
    await this.sub.close();
    await this.connection.close();
  }
}
