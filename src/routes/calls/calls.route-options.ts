import { RouteOptionsWithoutHandler } from '../../infrastructure/api/types/RouteOptionsWithoutHandler';

export const createCallRouteOptions: RouteOptionsWithoutHandler = {
  method: 'POST',
  url: '/api/v1/call',
  schema: {
    description: 'Accepts an object with call options and initiates a call',
    summary: 'Create a call',
    tags: ['calls'],
    body: {
      $ref: 'CallDetails#',
    },
    response: {
      200: {
        description: 'Call initiated successfully',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
};
