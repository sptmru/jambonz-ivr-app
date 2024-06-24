import { Client, Session } from '@jambonz/node-client-ws';
// import { WsEvent } from './base/event.interface';

export type WsData = {
  client?: Client;
  session: Session;
};
