import { SipHeaders } from './headers.type';
import { SipPayload } from './payload.type';

export type SipMessage = {
  headers: SipHeaders;
  raw: string;
  method: string;
  version: string;
  uri: string;
  payload: SipPayload;
};
