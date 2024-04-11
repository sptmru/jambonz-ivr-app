export type VoslogicDtmfPayload = {
  transactionid: string;
  from: string;
  to: string;
  Disposition: VoslogicApiDispositionEnum;
};

// eslint-disable-next-line no-shadow
export enum VoslogicApiDispositionEnum {
  VM = 'VM',
  OPTOUT = 'OPTOUT',
  CONTINUE = 'CONTINUE',
}
