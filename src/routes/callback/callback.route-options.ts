import { RouteOptionsWithoutHandler } from '../../infrastructure/api/types/RouteOptionsWithoutHandler';

export const IvrInitiateCallbackRouteOptions: RouteOptionsWithoutHandler = {
  method: 'POST',
  url: '/api/v1/ivr-callback',
  schema: {
    description: 'Accepts a callback and proceeds with the call logic',
    summary: 'Handle a call in a callback',
    tags: ['callbacks'],
    response: {
      200: {
        description: 'Call processed successfully',
        type: 'array',
      },
      500: {
        description: 'Error when trying to handle a call',
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
};

export const StatusCallbackRouteOptions: RouteOptionsWithoutHandler = {
  method: 'POST',
  url: '/api/v1/ivr-callback',
  schema: {
    description: 'Callback for call status logging',
    summary: 'Logs call status',
    tags: ['callbacks'],
    response: {
      200: {
        description: 'Call status logged successfully',
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      500: {
        description: 'Error when logging call status',
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
};

export const AmdCallbackRouteOptions: RouteOptionsWithoutHandler = {
  method: 'POST',
  url: '/api/v1/amd-callback',
  schema: {
    description: 'Accepts AMD callback and proceeds with the call logic',
    summary: 'Check AMD results and proceed with the call',
    tags: ['callbacks'],
    response: {
      200: {
        description: 'AMD processed successfully',
        type: 'array',
      },
      500: {
        description: 'Error when getting AMD',
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
};

export const DtmfCallbackRouteOptions: RouteOptionsWithoutHandler = {
  method: 'POST',
  url: '/api/v1/dtmf-callback',
  schema: {
    description: 'Accepts DTMF callback and proceeds with the call logic',
    summary: 'Check DTMF results and proceed with the call',
    tags: ['callbacks'],
    response: {
      200: {
        description: 'DTMF processed successfully',
        type: 'array',
      },
      500: {
        description: 'Error when getting DTMF',
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
};
