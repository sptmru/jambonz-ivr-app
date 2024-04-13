export type SipContact = `${string}@${string}`;

export const isSipContact = (value: string): value is SipContact =>
  typeof value === 'string' && /^[^@]+@[^@]+$/.test(value);

// eslint-disable-next-line no-shadow
export enum CallDestinationTypeEnum {
  PSTN = 'phone',
  INTERNAL_USER = 'user',
  SIP_ENDPOINT = 'sip',
}

export type CallDestination =
  | { type: 'phone'; number: string; trunk?: string; confirmHook?: string }
  | { type: 'user'; name: SipContact; confirmHook?: string }
  | { type: 'sip'; sipUri: SipContact; auth?: { username?: string; password?: string }; confirmHook?: string };
