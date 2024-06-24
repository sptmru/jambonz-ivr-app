import { createServer, Server } from 'http';
import { createEndpoint, Client } from '@jambonz/node-client-ws';
import { pino } from 'pino';

import { config } from '../config/config';
import { logger } from '../../misc/Logger';

export class WebsocketServer {
  public server: Server;
  public initEndpoint: (params: { path: string }) => Client;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor() {
    this.server = createServer();
    this.initEndpoint = createEndpoint({ server: this.server, logger: pino({ level: config.log.level }) });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public addEndpoints(endpoints: { forEach: (arg0: (route: any) => void) => void }): void {
    endpoints.forEach(endpoint => {
      void new endpoint(this.initEndpoint);
    });
  }

  public listen(): void {
    this.server.listen(config.ws.port, '0.0.0.0', () => {
      logger.info(`WS server is listening on ws://${config.ws.hostname}:${config.ws.port}`);
    });
  }
}
