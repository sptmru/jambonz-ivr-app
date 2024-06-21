import { CallDirectionEnum } from '../ivrinitiateresult.type';
import { WsMessage } from './base/message.interface';
import { WsMessageTypeEnum } from './base/messagetype.enum';
import { SpeechData } from './base/speechdata.type';

type WsCallStatusData = {
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
  defaults: SpeechData;
};

export type WsCallStatus = WsMessage<WsCallStatusData> & {
  type: WsMessageTypeEnum.CALL_STATUS;
};
