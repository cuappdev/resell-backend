import { Body, CurrentUser, Delete, Get, JsonController, Params, Post } from 'routing-controllers';
import { ExpoPushMessage, PushTicket, FindTokensRequest } from 'src/types';
import { NotifService } from '../../services/NotifService';
import { OpenAPI } from 'routing-controllers-openapi';

@JsonController('notif/')
export class NotifController {
    private notifService: NotifService;

    constructor(notifService: NotifService) {
      this.notifService = notifService;
    }

    @Post()
    @OpenAPI({
      summary: 'Send notification',
      description: 'Sends a notification to a user',
      responses: {
        '200': { description: 'Notification sent successfully' },
        '400': { description: 'Invalid request body' }
      }
    })
    async sendNotif(@Body() findTokensRequest: FindTokensRequest) {
      return this.notifService.sendNotifs(findTokensRequest);
    }
}

