import Connection, { Consumer, Publisher } from 'rabbitmq-client';
import { config } from '../config/config';
import { logger } from '../../misc/Logger';
import { CallDetails } from '../../domain/types/calldetails.type';

interface MessageHandler {
  (param1: CallDetails): Promise<void>;
}

// MQ Consumer handler must return 1 to requeue the message
const REQUEUE_MESSAGE = 2;

export class MQClient {
  private connection: Connection;
  private sub: Consumer;
  private pub: Publisher | null = null;
  private queueName: string;
  private isConsuming: boolean = false;
  public isConnected: boolean = false;
  public isPaused: boolean = false;
  private static instance: MQClient | null = null;
  private messageHandler: MessageHandler;
  private activeCalls: number = 0;
  private readonly MAX_CONCURRENT_CALLS_PER_IVR_APP_INSTANCE: number = config.calls.maxConcurrentCallsPerInstance;

  private constructor() {
    this.connectWithRetry();
  }

  static getInstance(): MQClient {
    if (!MQClient.instance) {
      MQClient.instance = new MQClient();
    }
    return MQClient.instance;
  }

  private async connectWithRetry(retries = 5, delayMs = 5000): Promise<void> {
    while (retries > 0) {
      try {
        this.connection = new Connection({ url: config.rabbitmq.uri, heartbeat: config.rabbitmq.heartbeat });
        
        this.connection.on('error', err => {
          this.isConnected = false;
          logger.error(`RabbitMQ connection error: ${err}`);
        });

        this.connection.on('connection', () => {
          this.isConnected = true;
          logger.info('RabbitMQ connection (re)established');
        });

        await this.connection.connect();
        logger.info('RabbitMQ connection established successfully.');
        return;
      } catch (err) {
        retries--;
        logger.error(`RabbitMQ connection failed. Retrying in ${delayMs}ms... (${retries} attempts left)`);
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
    logger.error('RabbitMQ connection failed after multiple retries.');
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
        queueOptions: { durable: true, exclusive: true }, // Exclusive mode ensures only one consumer
        qos: { prefetchCount: this.MAX_CONCURRENT_CALLS_PER_IVR_APP_INSTANCE },
      },
      async msg => {
        if (this.activeCalls >= this.MAX_CONCURRENT_CALLS_PER_IVR_APP_INSTANCE) {
          logger.warn(`Max concurrent calls reached. Requeuing message.`);
          return REQUEUE_MESSAGE;
        }

        try {
          const parsedMessage = JSON.parse(msg.body);
          logger.info({
            message: `Received message from ${queueName}: ${JSON.stringify(parsedMessage)}`,
            labels: {
              job: config.loki.labels.job,
              transaction_id: parsedMessage.transactionId,
              number_to: parsedMessage.numberTo,
              number_from: parsedMessage.numberFrom,
            },
          });

          logger.info(
            `Processing call request to ${parsedMessage.numberTo}, transaction ID: ${parsedMessage.transactionId}`
          );

          this.activeCalls++;
          
          // Await message processing to avoid race conditions
          await messageHandler(parsedMessage);

          this.decrementActiveCalls();
          return 0; // Acknowledge message after successful processing
        } catch (err) {
          logger.error(`Consumer error on queue ${queueName}: ${err}`);
          return REQUEUE_MESSAGE;
        }
      }
    );

    this.isConsuming = true;
    this.sub.on('error', err => {
      logger.error(`Consumer error on queue ${queueName}: ${err}`);
    });
  }

  async pauseConsumption(): Promise<void> {
    if (this.isConsuming) {
      await this.sub.close();
      this.isConsuming = false;
      this.isPaused = true;
      logger.info(`Paused consumption from ${this.queueName}`);
    }
  }

  resumeConsumption(): void {
    if (!this.isConsuming && this.isPaused) {
      this.consumeToQueue(this.queueName, this.messageHandler);
      this.isPaused = false;
      logger.info(`Resumed consumption from ${this.queueName}`);
    }
  }

  decrementActiveCalls(): void {
    if (this.activeCalls > 0) {
      this.activeCalls--;
    }
    if (this.activeCalls < this.MAX_CONCURRENT_CALLS_PER_IVR_APP_INSTANCE) {
      this.resumeConsumption();
    }
  }

  async onShutdown(): Promise<void> {
    logger.info('Shutting down RabbitMQ connection...');
    try {
      await this.sub.close();
      await this.pub?.close();
      await this.connection.close();
      logger.info('RabbitMQ shutdown complete.');
    } catch (err) {
      logger.error(`Error during RabbitMQ shutdown: ${err}`);
    }
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM. Shutting down consumer.');
  await MQClient.getInstance().onShutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT. Shutting down consumer.');
  await MQClient.getInstance().onShutdown();
  process.exit(0);
});
