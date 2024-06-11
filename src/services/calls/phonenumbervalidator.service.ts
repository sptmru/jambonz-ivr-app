import parsePhoneNumber, { PhoneNumber } from 'libphonenumber-js';
import { logger } from '../../misc/Logger';

export class PhoneNumberValidatorService {
  static validatePhoneNumber(phoneNumber: string): PhoneNumber | undefined {
    if (phoneNumber.length > 14) {
      phoneNumber = phoneNumber.substring(6);
    }
    const validatedNumber = phoneNumber.startsWith('+')
      ? parsePhoneNumber(phoneNumber)
      : parsePhoneNumber(`+${phoneNumber}`);
    if (validatedNumber && validatedNumber.isValid()) {
      logger.info(`Phone number ${validatedNumber.number} is a valid ${validatedNumber.country} number`);
    } else {
      logger.info(`Phone number ${phoneNumber} is not valid, considering that it is a SIP address`);
    }
    return validatedNumber;
  }
}
