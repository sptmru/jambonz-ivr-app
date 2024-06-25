import { WsMessage } from './base/message.interface';
import { WsMessageTypeEnum } from './base/messagetype.enum';

type WsVerbStatusData = {
  id: string;
  verb: string;
  status: string;
};

export type WsVerbStatus = WsMessage<WsVerbStatusData> & {
  type: WsMessageTypeEnum.VERB_STATUS;
};
