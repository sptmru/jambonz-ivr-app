import { AmdResultEnum } from '../../amdresult.type';
import { WsEvent } from '../base/event.interface';

export type WsAmdEvent = WsEvent & {
  type: AmdResultEnum;
  frequency: number;
  variance: 0;
};
