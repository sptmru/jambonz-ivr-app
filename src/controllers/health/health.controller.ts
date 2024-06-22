import { FastifyReply, FastifyRequest } from 'fastify';
import { MQClient } from '../../infrastructure/rabbitmq/client';
import { isApplicationExists } from '../../services/jambons/jambons-api-wrapper.service';

export class HealthController {
  static async healthcheck(_request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const mqConnected = MQClient.getInstance().isConnected;
    const jambonzAppExists = await isApplicationExists();
    if (!(mqConnected && jambonzAppExists)) {
      let errMessage: string;
      if (!mqConnected) {
        errMessage = 'RabbitMQ connection lost';
      } else {
        errMessage = 'Jambonz application not found, check your Jambonz credentials';
      }
      return reply.code(500).send({ error: errMessage });
    }
    return reply.code(200).send({ message: 'API is alive!' });
  }
}
