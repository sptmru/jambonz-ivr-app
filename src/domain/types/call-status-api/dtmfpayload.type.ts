export type CallStatusApiPayload = {
  transactionid: string;
  from: string;
  to: string;
  Disposition: CallStatusApiDispositionEnum;
};

// eslint-disable-next-line no-shadow
export enum CallStatusApiDispositionEnum {
  VM = 'VM',
  OPTIN = 'OPTIN',
  OPTOUT = 'OPTOUT',
  CONTINUE = 'CONTINUE',
  NO_ANSWER = 'NO_ANSWER',
  USER_BUSY = 'USER_BUSY',
  NOVMNOINPUT = 'NOVMNOINPUT',
}
