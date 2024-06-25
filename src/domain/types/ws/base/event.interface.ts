import { CallDetails } from '../../calldetails.type';
import { CallDirectionEnum } from '../../ivrinitiateresult.type';

export interface WsEvent {
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
  customerData: CallDetails;
  api_base_url: string;
}
