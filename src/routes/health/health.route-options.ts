import { RouteOptionsWithoutHandler } from '../../infrastructure/api/types/RouteOptionsWithoutHandler';

export const healthGetRouteOptions: RouteOptionsWithoutHandler = {
  method: 'GET',
  url: '/api/v1/health',
  schema: {
    tags: ['monitoring'],
    description: 'A healthcheck endpoint. Returns 200 if the API is alive, returns nothing if it is not',
    summary: 'Healtcheck endpoint',
    response: {
      200: {
        description: 'Successful response',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
};
