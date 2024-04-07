import Connection, { Consumer } from 'rabbitmq-client';
import { config } from '../config/config';
import { logger } from '../../misc/Logger';

interface MessageHandler {
  (param1: string): Promise<void>;
}

export class MQClient {
  private connection: Connection;
  private sub: Consumer;

  constructor() {
    this.connection = new Connection(config.rabbitmq.uri);
    this.connection.on('error', err => {
      // TODO: handle error properly
      logger.error(`RabbitMQ connection error: ${err}`);
    });
    this.connection.on('connection', () => {
      logger.debug('RabbitMQ connection (re)established');
    });
  }

  consumeToQueue(queueName: string, messageHandler: MessageHandler): void {
    this.sub = this.connection.createConsumer(
      {
        queue: queueName,
        queueOptions: { durable: true },
        qos: { prefetchCount: config.rabbitmq.prefetchCount },
      },
      async msg => {
        const parsedMessage = JSON.parse(msg.body);
        logger.debug(`Received a message from ${queueName}: ${JSON.stringify(parsedMessage)}`);
        return await messageHandler(parsedMessage);
      }
    );

    this.sub.on('error', err => {
      logger.error(`Consumer error on queue ${queueName}: ${err}`);
    });
  }

  async onShutdown(): Promise<void> {
    await this.sub.close();
    await this.connection.close();
  }
}
