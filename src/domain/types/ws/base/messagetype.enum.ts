// eslint-disable-next-line no-shadow
export enum WsMessageTypeEnum {
  SESSION_NEW = 'session:new',
  SESSION_REDIRECT = 'session:redirect',
  SESSION_RECONNECT = 'session:reconnect',
  CALL_STATUS = 'call:status',
  VERB_HOOK = 'verb:hook',
  VERB_STATUS = 'verb:status',
  JAMBONZ_ERROR = 'jambonz:error',
  ACK = 'ack',
  COMMAND = 'command',
}
