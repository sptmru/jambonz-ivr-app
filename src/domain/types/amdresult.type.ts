export type AmdResult = {
  type: AmdResultEnum;
  reason?: string;
  hint?: string;
  language?: string;
  call_sid: string;
};

// eslint-disable-next-line no-shadow
export enum AmdResultEnum {
  HUMAN = 'amd_human_detected',
  MACHINE = 'amd_machine_detected',
  NO_SPEECH = 'amd_no_speech_detected',
  DECISION_TIMEOUT = 'amd_decision_timeout',
}
