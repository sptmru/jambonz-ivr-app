import { PhoneNumber } from 'libphonenumber-js';
import {
  CallDestination,
  CallDestinationTypeEnum,
  SipContact,
  isSipContact,
} from '../../domain/types/calldestination.type';
import { CallDetails } from '../../domain/types/calldetails.type';
import { config } from '../../infrastructure/config/config';
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
  static createCall(callDetails: CallDetails): void {
    logger.info({
      message: `Initial request to create a call to number ${callDetails.numberTo} received`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
      },
    });

    const callDestinationData = CallsService.prepareCallDestination(callDetails.numberTo, callDetails);

    const callDestination =
      // eslint-disable-next-line no-nested-ternary
      callDestinationData.type === CallDestinationTypeEnum.PSTN
        ? callDestinationData.number
        : callDestinationData.type === CallDestinationTypeEnum.INTERNAL_USER
          ? callDestinationData.name
          : callDestinationData.sipUri;

    logger.info({
      message: `Creating a call to destination ${callDestination}`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
      },
    });

    void jambonz.calls.create({
      from: callDetails.numberFrom,
      to: callDestinationData,
      application_sid: config.jambonz.applicationSid,
      amd: {
        actionHook: config.ws.enabled
          ? `${config.ws.baseUrl}/${config.ws.uri}/${config.ws.ivrEndpoint}/amd`
          : `${config.jambonz.callbackBaseUrl}/api/v1/amd-callback`,
        thresholdWordCount: config.jambonz.amd.thresholdWordCount,
        timers: {
          noSpeechTimeoutMs: config.jambonz.amd.timers.noSpeechTimeoutMs,
          decisionTimeoutMs: config.jambonz.amd.timers.decisionTimeoutMs,
          toneTimeoutMs: config.jambonz.amd.timers.toneTimeoutMs,
          greetingCompletionTimeoutMs: config.jambonz.amd.timers.greetingCompletionTimeoutMs,
        },
      },
      tag: callDetails,
    });
  }
}
