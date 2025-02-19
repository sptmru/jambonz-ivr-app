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
import { CallResolverStorageService } from './call-resolver-storage-service.service';

export class CallsService {
  static prepareCallDestination(dest: string, callDetails: CallDetails, usePlusSign: boolean = false): CallDestination {
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
      const numberPrefix =
        callDetails.prefix !== undefined && callDetails.prefix.length > 0
          ? callDetails.prefix
          : config.jambonz.defaultPrefix;
      logger.info(`Prefix in the payload is ${callDetails.prefix}`);
      logger.info(`Default prefix is ${config.jambonz.defaultPrefix}`);
      logger.info(`Using number prefix ${numberPrefix} for call to ${dest}`);
      return {
        type: CallDestinationTypeEnum.PSTN,
        number: `${numberPrefix}${usePlusSign ? '+' : ''}${(validatedPhoneNumber as PhoneNumber).number.toString().substring(1)}`,
        trunk: callDetails.carrierAddress,
      };
    }
  }
  static async createCall(callDetails: CallDetails): Promise<void> {
    logger.info({
      message: `Initial request to create a call to number ${callDetails.numberTo} received`,
      labels: {
        job: config.loki.labels.job,
        transaction_id: callDetails.transactionId,
        number_to: callDetails.numberTo,
        number_from: callDetails.numberFrom,
      },
    });

    const callDestinationData = CallsService.prepareCallDestination(callDetails.numberTo, callDetails, false);

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
        number_from: callDetails.numberFrom,
      },
    });

    try {
      const callSid = await jambonz.calls.create({
        from: callDetails.numberFrom,
        to: callDestinationData,
        application_sid: config.jambonz.applicationSid,
        amd: {
          actionHook: config.ws.enabled ? `/amd` : `${config.jambonz.callbackBaseUrl}/api/v1/amd-callback`,
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
      logger.info(`Call request to ${callDetails.numberTo}, transaction ID: ${callDetails.transactionId} processed`);
      await new Promise<void>(resolve => CallResolverStorageService.getInstance().addCallToStorage(callSid, resolve));
      return;
    } catch (err) {
      logger.error({
        message: `Got error from Jambonz API when creating a call: ${err}`,
        labels: {
          job: config.loki.labels.job,
          transaction_id: callDetails.transactionId,
          number_to: callDetails.numberTo,
          number_from: callDetails.numberFrom,
        },
      });
      logger.error(`Call request to ${callDetails.numberTo}, transaction ID: ${callDetails.transactionId} failed`);
      return;
    }
  }

  static resolveCallHandler(callSid: string): void {
    CallResolverStorageService.getInstance().resolveCallHandler(callSid);
  }
}
