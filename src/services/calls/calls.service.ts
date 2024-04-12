import { CallDetails } from '../../domain/types/calldetails.type';
import { config } from '../../infrastructure/config/config';
import { RedisClient } from '../../infrastructure/redis/client';
import { jambonz } from '../jambons/jambons-api-wrapper.service';
import { PhoneNumberValidatorService } from './phonenumbervalidator.service';

export class CallsService {
  static async createCall(callDetails: CallDetails): Promise<void> {
    const phoneNumber = PhoneNumberValidatorService.validatePhoneNumber(callDetails.numberTo);
    const destination =  phoneNumber 
      ? { type: 'phone', number: phoneNumber.number, trunk: callDetails.carrierAddress } 
      : { type: 'user', name: `${callDetails.numberTo}@${config.jambonz.sipRealm}` };
    const callId = await jambonz.calls.create({
      from: callDetails.numberFrom,
      to: destination,
      application_sid: config.jambonz.applicationSid,
      amd: { actionHook: `${config.jambonz.callbackBaseUrl}/api/v1/amd-callback` },
    });
    await RedisClient.getInstance().saveCallDetails(callId, callDetails);
  }
}
