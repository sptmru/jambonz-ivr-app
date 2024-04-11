import { config } from '../../infrastructure/config/config';

export const swaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'IVR API',
      description: 'IVR API Documentation',
      version: '1.0.0',
    },
    consumes: ['application/json'],
    produces: ['application/json'],
    servers: [
      {
        url: config.api.hostname,
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
    tags: [
      {
        name: 'calls',
        description: 'Calls-related API endpoints',
      },
      {
        name: 'callbacks',
        description: 'Jambonz callback endpoints',
      },
      {
        name: 'monitoring',
        description: 'Monitoring endpoints',
      },
    ],
  },
};
