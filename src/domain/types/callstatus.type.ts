import { CallDetails } from './calldetails.type';

export type CallStatus = {
  account_sid: string;
  api_base_url: string;
  application_sid: string;
  call_id: string;
  call_sid: string;
  call_status: string;
  call_termination_by: string;
  direction: string;
  duration: number;
  from: string;
  fs_public_ip: string;
  fs_sip_address: string;
  sip_reason: string;
  sip_status: number;
  to: string;
  trace_id: string;
  timestamp: string;
  customerData: CallDetails;
};
