import { WsMessage } from './base/message.interface';
import { WsMessageTypeEnum } from './base/messagetype.enum';

type WsJambonzErrorData = {
  error: string;
  verb: string;
};

export type WsJambonzError = WsMessage<WsJambonzErrorData> & {
  type: WsMessageTypeEnum.JAMBONZ_ERROR;
};
