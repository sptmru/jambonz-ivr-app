import { CallDetails } from '../calldetails.type';
import { CallDirectionEnum } from '../ivrinitiateresult.type';
import { SipMessage } from '../sip/message.type';
import { WsMessage } from './base/message.interface';
import { WsMessageTypeEnum } from './base/messagetype.enum';

type WsSessionRedirectData = {
  sip: SipMessage;
  direction: CallDirectionEnum;
  caller_name: string;
  call_sid: string;
  account_sid: string;
  application_sid: string;
  from: string;
  to: string;
  call_id: string;
  sip_status: number;
  call_status: string;
  originating_sip_ip: string;
  originating_sip_trunk_name: string;
  local_sip_address: string;
  customerData: CallDetails;
};

export type WsSessionRedirect = WsMessage<WsSessionRedirectData> & {
  type: WsMessageTypeEnum.SESSION_REDIRECT;
};
