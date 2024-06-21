import { WsMessage } from './base/message.interface';
import { WsMessageTypeEnum } from './base/messagetype.enum';

type WsCommandData = {
  say: {
    id: string;
    text: string;
  };
};

export type WsCommand = WsMessage<WsCommandData> & {
  type: WsMessageTypeEnum.COMMAND;
};
