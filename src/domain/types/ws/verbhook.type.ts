import { WsMessage } from './base/message.interface';
import { WsMessageTypeEnum } from './base/messagetype.enum';

type SpeechAlternatives = {
  confidence: number;
  transcript: string;
};

type Transcript = {
  is_final: boolean;
  language_code: string;
  alternatives: SpeechAlternatives[];
};

type WsVerbHookdata = {
  speech: {
    is_final: boolean;
    transcripts: Transcript[];
  };
};

export type WsVerbHook = WsMessage<WsVerbHookdata> & {
  reason: string;
  type: WsMessageTypeEnum.VERB_HOOK;
};
