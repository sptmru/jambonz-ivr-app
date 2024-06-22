import { createServer, Server } from 'http';
import { createEndpoint, Client } from '@jambonz/node-client-ws';

import { config } from '../config/config';
import { logger } from '../../misc/Logger';

export class WebsocketServer {
  public server: Server;
  public initService: (params: { path: string }) => Client;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(init: { routes: any }) {
    this.routes(init.routes);
    this.server = createServer();
    this.initService = createEndpoint({ server: this.server });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private routes(routes: { forEach: (arg0: (route: any) => void) => void }): void {
    routes.forEach(route => {
      void new route(this.initService);
    });
  }

  public listen(): void {
    this.server.listen(config.ws.port, config.ws.hostname, () => {
      logger.info(`WS server listening on ws://${config.ws.hostname}:${config.ws.port}`);
    });
  }
}
