import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {logger} from "../../misc/Logger";

export class TestRoute {
  public prefix: string = '/dtmf';

  // eslint-disable-next-line require-await
  async routes(fastify: FastifyInstance): Promise<void> {
    fastify.post('/', (request: FastifyRequest, reply: FastifyReply) => {
      logger.info('request to test route');
      console.dir(request.body);
      return reply.code(200).send({ message: 'test'})
    })
  }
}
