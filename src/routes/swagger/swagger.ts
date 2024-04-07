import { config } from '../../infrastructure/config/config';

export const swaggerOptions = {
  openapi: {
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
    components: {},
    tags: [
      {
        name: 'monitoring',
        description: 'Monitoring endpoints',
      },
    ],
  },
};
