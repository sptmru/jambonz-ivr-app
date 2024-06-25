import { WsEvent } from '../base/event.interface';

export type WsDtmfEvent = WsEvent & {
  digits?: string;
  reason: string;
};
