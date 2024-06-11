export type SipAuthData = undefined | { username?: string; password?: string };

export type CallDetails = {
  numberTo: string;
  numberFrom: string;
  wavUrlAnnounce: string;
  wavUrlContinue: string;
  wavUrlOptOut: string;
  wavUrlVM: string;
  transactionId: string;
  carrierAddress: string;
  destinationAddress: string;
  digitContinue: string;
  digitOptOut: string;
  sipAuthData?: SipAuthData;
  amdProcessed?: boolean;
};
