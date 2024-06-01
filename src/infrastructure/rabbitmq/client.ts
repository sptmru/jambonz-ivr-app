import Connection, { Consumer, Publisher } from 'rabbitmq-client';
import { config } from '../config/config';
import { logger } from '../../misc/Logger';
import { CallDetails } from '../../domain/types/calldetails.type';
import { RedisClient } from '../redis/client';
import { CallStatus } from '../../domain/types/callstatus.type';

interface MessageHandler {
  (param1: CallDetails): Promise<void>;
}

export class MQClient {
  private connection: Connection;
  private sub: Consumer;
  private pub: Publisher | null = null;
  private queueName: string;
  private messageHandler: MessageHandler;
  private isConsuming: boolean = false;
  public isConnected: boolean = false;
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
      this.isConnected = false;
      logger.error(`RabbitMQ connection error: ${err}`);
    });
    this.connection.on('connection', () => {
      this.isConnected = true;
      logger.info('RabbitMQ connection (re)established');
    });
  }

  onRedisConnected(): void {
    if (this.isConsuming) {
      logger.info(`Already consuming from ${this.queueName}`);
      return;
    }
    logger.info(`Redis connection is reestablished, resuming RabbitMQ message consumption`);
    this.consumeToQueue(this.queueName, this.messageHandler);
  }

  onRedisDisconnected(): void {
    if (!this.isConsuming) {
      logger.info(`Not consuming from ${this.queueName}`);
      return;
    }
    logger.info(`Redis connection is lost, stopping RabbitMQ message consumption`);
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
          logger.info(`Got unparsed message from ${queueName}: ${msg.body}`);
          logger.info(msg.body);
          const parsedMessage = JSON.parse(msg.body);
          logger.info(`Received a message from ${queueName}: ${JSON.stringify(parsedMessage)}`);

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

  async publishToQueue(queueName: string, message: CallStatus): Promise<void> {
    if (!this.pub) {
      this.pub = this.connection.createPublisher({
        confirm: true,
        maxAttempts: 2,
      });
    }

    logger.info(`Publishing call id ${message.call_sid} status to ${queueName}`);

    try {
      await this.pub.send(config.rabbitmq.callStatusQueue, message);
    } catch (err) {
      logger.error(`Error while publishing to ${queueName}: ${err}`);
    }
  }

  async onShutdown(): Promise<void> {
    await this.sub.close();
    await this.pub?.close();
    await this.connection.close();
  }
}
