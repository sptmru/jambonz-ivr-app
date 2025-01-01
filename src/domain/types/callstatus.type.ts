import { CallDetails } from './calldetails.type';

// eslint-disable-next-line no-shadow
export enum CallStatusEnum {
  TRYING = 'trying',
  RINGING = 'ringing',
  ALERTING = 'alerting',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  BUSY = 'busy',
  NO_ANSWER = 'no-answer',
  FAILED = 'failed',
  QUEUED = 'queued',
}

export type FinalCallStatus = CallStatusEnum.COMPLETED | CallStatusEnum.BUSY | CallStatusEnum.NO_ANSWER | CallStatusEnum.FAILED;

export const isFinalCallStatus = (value: string): value is FinalCallStatus =>
  value === CallStatusEnum.COMPLETED ||
  value === CallStatusEnum.BUSY ||
  value === CallStatusEnum.NO_ANSWER ||
  value === CallStatusEnum.FAILED;

export type CallStatus = {
  account_sid: string;
  api_base_url: string;
  application_sid: string;
  call_id: string;
  call_sid: string;
  call_status: CallStatusEnum;
  call_termination_by: string;
  direction: string;
  duration: number;
  from: string;
  fs_public_ip: string;
  fs_sip_address: string;
  sip_reason: string;
  sip_status: number;
  to: string;
  trace_id: string;
  timestamp: string;
  customerData: CallDetails;
};
