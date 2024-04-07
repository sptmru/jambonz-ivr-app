import { CallDetails } from '../../domain/types/calldetails.type';
import { jambonz } from '../jambons/jambons-api-wrapper.service';

export class CallsService {
  static async createCall(callDetails: CallDetails): Promise<void> {
    await jambonz.calls.create({
      from: callDetails.numberFrom,
      to: {
        type: 'phone',
        number: callDetails.numberTo,
      },
      call_hook: 'http://myurl.com/myapp-webhook',
      call_status_hook: 'http://myurl.com/call-status',
    });
  }
}
