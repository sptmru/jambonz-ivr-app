import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: '/api/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (_request, _reply, next) {
      next();
    },
    preHandler: function (_request, _reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: header => header,
  transformSpecification: swaggerObject => swaggerObject,
  transformSpecificationClone: true,
};
