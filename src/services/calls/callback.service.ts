import { WebhookResponse } from '@jambonz/node-client';
import { logger } from '../../misc/Logger';

export class CallbacksService {
  static ivrCallback(): WebhookResponse {
    logger.debug(`Handling an IVR callback`);
    const jambonz = new WebhookResponse();
    return jambonz.pause({ length: 1.5 }).play({
      url: 'https://ivr-app.sptm.space/sounds/demo-thanks.wav',
    });
  }
}
