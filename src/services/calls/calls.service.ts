import { CallDetails } from '../../domain/types/calldetails.type';
import { config } from '../../infrastructure/config/config';
import { RedisClient } from '../../infrastructure/redis/client';
import { jambonz } from '../jambons/jambons-api-wrapper.service';

export class CallsService {
  static async createCall(callDetails: CallDetails): Promise<void> {
    const callId = await jambonz.calls.create({
      from: callDetails.numberFrom,
      to: {
        type: 'user', // TODO: change type to "phone"
        name: `${callDetails.numberTo}@${config.jambonz.sipRealm}`,
      },
      application_sid: config.jambonz.applicationSid,
      amd: { actionHook: `${config.jambonz.callbackBaseUrl}/api/v1/amd-callback` },
    });
    await RedisClient.getInstance().saveCallDetails(callId, callDetails);
  }
}
