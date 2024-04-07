export type VoslogicApiDispositionOptions = 'VM' | 'OPTOUT' | 'CONTINUE';

export type VoslogicDtmfPayload = {
  transactionid: string;
  from: string;
  to: string;
  Disposition: VoslogicApiDispositionOptions;
};
