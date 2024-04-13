export const SipAuthDataDefinition = {
  $id: 'SipAuthData',
  type: 'object',
  required: [],
  properties: {
    username: { type: 'string' },
    password: { type: 'string' },
  },
};

export const CallDetailsDefinition = {
  $id: 'CallDetails',
  type: 'object',
  required: [
    'numberTo',
    'numberFrom',
    'wavUrlAnnounce',
    'wavUrlContinue',
    'wavUrlOptOut',
    'wavUrlVM',
    'transactionId',
    'carrierAddress',
    'destinationAddress',
    'digitContinue',
    'digitOptOut',
  ],
  properties: {
    numberTo: { type: 'string' },
    numberFrom: { type: 'string' },
    wavUrlAnnounce: { type: 'string' },
    wavUrlContinue: { type: 'string' },
    wavUrlOptOut: { type: 'string' },
    wavUrlVM: { type: 'string' },
    transactionId: { type: 'string' },
    carrierAddress: { type: 'string' },
    destinationAddress: { type: 'string' },
    digitContinue: { type: 'string' },
    digitOptOut: { type: 'string' },
    sipAuthData: { $ref: 'SipAuthData#' },
  },
};
