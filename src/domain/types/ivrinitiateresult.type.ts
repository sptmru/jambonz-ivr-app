import { CallDetails } from './calldetails.type';

export type IvrInitiateResult = {
  call_sid: string;
  direction: CallDirectionEnum;
  from: string;
  to: string;
  call_id: string;
  sip_status: number;
  sip_reason: string;
  call_status: string;
  account_sid: string;
  trace_id: string;
  application_sid: string;
  fs_sip_address: string;
  api_base_url: string;
  fs_public_api: string;
  digits: string;
  reason: string;
  customerData: CallDetails;
};

// eslint-disable-next-line no-shadow
export enum CallDirectionEnum {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}
