import { JsonController, Post } from 'routing-controllers';
import { ExpoPushMessage, PushTicket } from 'src/types';
import { NotifService } from '../../services/NotifService';

@JsonController('notif/')
export class NotifController {
    private notifService: NotifService;

    constructor(notifService: NotifService) {
      this.notifService = notifService;
    }

    @Post()
    async sendPost( notifRequest : ExpoPushMessage ) {
        return this.notifService.sendNotifs(notifRequest, {});
    }
}