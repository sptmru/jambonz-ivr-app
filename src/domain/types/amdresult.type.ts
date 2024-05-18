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
  MACHINE_STOPPED = 'amd_machine_stopped_speaking',
  BEEP = 'amd_tone_detected',
  ERROR = 'amd_error',
  DETECTION_STOPPED = 'amd_stopped',
}

export type AmdMachine = Exclude<
  AmdResultEnum,
  | AmdResultEnum.HUMAN
  | AmdResultEnum.MACHINE_STOPPED
  | AmdResultEnum.DETECTION_STOPPED
  | AmdResultEnum.ERROR
  | AmdResultEnum.DECISION_TIMEOUT
>;
export type AmdFinalEvent = AmdResultEnum.DETECTION_STOPPED | AmdResultEnum.ERROR | AmdResultEnum.DECISION_TIMEOUT;

export type AmdMachineStoppedSpeaking = AmdResultEnum.MACHINE_STOPPED;

export const isAmdMachine = (value: string): value is AmdMachine => value === AmdResultEnum.MACHINE;

export const isAmdHuman = (value: string): value is AmdResultEnum.HUMAN =>
  value === AmdResultEnum.HUMAN || value === AmdResultEnum.NO_SPEECH;

export const isAmdDecisionTimeout = (value: string): value is AmdResultEnum.DECISION_TIMEOUT =>
  value === AmdResultEnum.DECISION_TIMEOUT;

export const isAmdFinalEvent = (value: string): value is AmdFinalEvent =>
  value === AmdResultEnum.DETECTION_STOPPED || value === AmdResultEnum.ERROR;

export const machineStoppedSpeaking = (value: string): value is AmdMachineStoppedSpeaking =>
  value === AmdResultEnum.MACHINE_STOPPED || value === AmdResultEnum.BEEP;
