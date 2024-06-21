import { WsMessage } from './base/message.interface';
import { WsMessageTypeEnum } from './base/messagetype.enum';

type WsAckData = {
  text: string;
  verb: string;
};

export type WsAck = WsMessage<WsAckData> & {
  type: WsMessageTypeEnum.ACK;
};
