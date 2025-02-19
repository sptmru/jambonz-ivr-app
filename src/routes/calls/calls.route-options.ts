import { Api } from '../../infrastructure/api/server';
import { RouteOptionsWithoutHandler } from '../../infrastructure/api/types/RouteOptionsWithoutHandler';

export const resolveCallHandlerRouteOptions: RouteOptionsWithoutHandler = {
  method: 'POST',
  url: '/api/v1/call/resolve/:callSid',
  preValidation: [Api.addAuthToRoute],
  schema: {
    description:
      'Accepts a call SID and resolves (ends) the call request handler function. Must be executed once a call is finished',
    summary: 'Resolve call request handler function via HTTP API',
    tags: ['calls'],
    params: {
      type: 'object',
      properties: {
        callSid: {
          type: 'string',
          description: 'Call SID',
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
    response: {
      200: {
        description: 'Call resolved successfully',
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
        description: 'Error when trying to resolve a call',
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
};

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
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
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
