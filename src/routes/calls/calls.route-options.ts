import { Api } from '../../infrastructure/api/server';
import { RouteOptionsWithoutHandler } from '../../infrastructure/api/types/RouteOptionsWithoutHandler';

export const createCallRouteOptions: RouteOptionsWithoutHandler = {
  method: 'POST',
  url: '/api/v1/call',
  preValidation: [Api.addAuthToRoute],
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
      401: {
        description: 'Authorization error',
        type: 'object',
        properties: {
          message: { error: 'string' },
        },
      },
      500: {
        description: 'Error when trying to initiate a call',
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
};
