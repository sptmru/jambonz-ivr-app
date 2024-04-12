import parsePhoneNumber, { PhoneNumber } from 'libphonenumber-js';
import { logger } from '../../misc/Logger';

export class PhoneNumberValidatorService {
  static validatePhoneNumber(phoneNumber: string): PhoneNumber | undefined {
    logger.info(`Validating phone number: ${phoneNumber}`);
    const validatedNumber = parsePhoneNumber(phoneNumber);
    if (validatedNumber && validatedNumber.isValid()) {
      logger.info(`Phone number ${validatedNumber.number} is a valid ${validatedNumber.country} number`);
    } else {
      logger.error(`Phone number ${phoneNumber} is not valid, considering that it is a SIP address`);
    }
    return validatedNumber;
  }
}
