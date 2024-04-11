import parsePhoneNumber, { PhoneNumber } from 'libphonenumber-js';

export class PhoneNumberValidatorService {
  static validatePhoneNumber(phoneNumber: string): PhoneNumber | undefined {
    return parsePhoneNumber(phoneNumber);
  }
}
