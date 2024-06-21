import { createServer, Server } from 'http';

import { config } from '../config/config';
import { logger } from '../../misc/Logger';

export class WebsocketServer {
  public server: Server;

  constructor() {
    this.server = createServer();
  }

  public listen(): void {
    this.server.listen(config.ws.port, config.ws.hostname, () => {
      logger.info(`WS server listening on ws://${config.ws.hostname}:${config.ws.port}`);
    });
  }
}
