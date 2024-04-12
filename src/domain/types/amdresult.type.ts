export type AmdResult = {
  call_id: string;
  call_sid: string;
  application_sid: string;
  account_sid: string;
  from: string;
  to: string;
  direction: string;
  call_status: string;
  sip_status: number;
  sip_reason: string;
  fs_sip_address: string;
  fs_public_ip: string;
  timestamp: string;
  trace_id: string;
  type: AmdResultEnum;
  reason?: string;
  hint?: string;
  language?: string;
};

// eslint-disable-next-line no-shadow
export enum AmdResultEnum {
  HUMAN = 'amd_human_detected',
  MACHINE = 'amd_machine_detected',
  NO_SPEECH = 'amd_no_speech_detected',
  DECISION_TIMEOUT = 'amd_decision_timeout',
}
