import { WsMessageTypeEnum } from './messagetype.enum';

export interface WsMessage<T> {
  type: WsMessageTypeEnum;
  msgid: string;
  call_sid: string;
  data: T;
}
