import Connection, { Consumer, Publisher } from 'rabbitmq-client';
import { config } from '../config/config';
import { logger } from '../../misc/Logger';
import { CallDetails } from '../../domain/types/calldetails.type';

interface MessageHandler {
  (param1: CallDetails): Promise<void>;
}

export class MQClient {
  private connection: Connection;
  private sub: Consumer;
  private pub: Publisher | null = null;
  private queueName: string;
  private isConsuming: boolean = false;
  public isConnected: boolean = false;
  private static instance: MQClient | null = null;

  private readonly MAX_MESSAGES: number = config.rabbitmq.prefetchCount;

  constructor() {
    this.connect();
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

  consumeToQueue(queueName: string, messageHandler: MessageHandler): void {
    this.queueName = queueName;

    if (this.isConsuming) {
      logger.warn(`Already consuming from ${this.queueName}`);
      return;
    }

    this.sub = this.connection.createConsumer(
      {
        queue: queueName,
        queueOptions: { durable: true },
        qos: { prefetchCount: this.MAX_MESSAGES },
      },
      async msg => {
        try {
          const parsedMessage = JSON.parse(msg.body);
          logger.info({
            message: `Received a message from ${queueName}: ${JSON.stringify(parsedMessage)}`,
            labels: {
              job: config.loki.labels.job,
              transaction_id: parsedMessage.transactionId,
              number_to: parsedMessage.numberTo,
              number_from: parsedMessage.numberFrom,
            },
          });

          await messageHandler(parsedMessage);
        } catch (err) {
          logger.error(`Consumer error on queue ${queueName}: ${err}`);
          throw err;
        }
      }
    );
    this.isConsuming = true;

    this.sub.on('error', err => {
      logger.error(`Consumer error on queue ${queueName}: ${err}`);
    });
  }

  async onShutdown(): Promise<void> {
    await this.sub.close();
    await this.pub?.close();
    await this.connection.close();
  }
}
