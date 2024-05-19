import { PhoneNumber } from 'libphonenumber-js';
import {
  CallDestination,
  CallDestinationTypeEnum,
  SipContact,
  isSipContact,
} from '../../domain/types/calldestination.type';
import { CallDetails } from '../../domain/types/calldetails.type';
import { config } from '../../infrastructure/config/config';
import { RedisClient } from '../../infrastructure/redis/client';
import { logger } from '../../misc/Logger';
import { jambonz } from '../jambons/jambons-api-wrapper.service';
import { PhoneNumberValidatorService } from './phonenumbervalidator.service';

export class CallsService {
  static prepareCallDestination(dest: string, callDetails: CallDetails): CallDestination {
    if (isSipContact(dest)) {
      return dest.split('@')[1] === config.jambonz.sipRealm
        ? { type: CallDestinationTypeEnum.INTERNAL_USER, name: dest as SipContact }
        : {
            type: CallDestinationTypeEnum.SIP_ENDPOINT,
            sipUri: dest as SipContact,
            auth: callDetails.sipAuthData,
          };
    } else {
      const validatedPhoneNumber = PhoneNumberValidatorService.validatePhoneNumber(dest);
      return {
        type: CallDestinationTypeEnum.PSTN,
        number: (validatedPhoneNumber as PhoneNumber).number.toString(),
        trunk: callDetails.carrierAddress,
      };
    }
  }
  static async createCall(callDetails: CallDetails): Promise<void> {
    logger.info(`Initial request to create a call to number ${callDetails.numberTo} received`);

    const callId = await jambonz.calls.create({
      from: callDetails.numberFrom,
      to: CallsService.prepareCallDestination(callDetails.numberTo, callDetails),
      application_sid: config.jambonz.applicationSid,
      amd: {
        actionHook: `${config.jambonz.callbackBaseUrl}/api/v1/amd-callback`,
        thresholdWordCount: config.jambonz.amd.thresholdWordCount,
        timers: {
          noSpeechTimeoutMs: config.jambonz.amd.timers.noSpeechTimeoutMs,
          decisionTimeoutMs: config.jambonz.amd.timers.decisionTimeoutMs,
          toneTimeoutMs: config.jambonz.amd.timers.toneTimeoutMs,
          greetingCompletionTimeoutMs: config.jambonz.amd.timers.greetingCompletionTimeoutMs,
        },
      },
    });
    await RedisClient.getInstance().saveCallDetails(callId, callDetails);
  }
}
