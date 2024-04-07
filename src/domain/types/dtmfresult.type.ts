export type DtmfResult = {
  call_sid: string;
  direction: 'inbound' | 'outbound';
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
};
