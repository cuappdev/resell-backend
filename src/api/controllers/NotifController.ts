import { Body, CurrentUser, Delete, Get, JsonController, Params, Post } from 'routing-controllers';
import { FindTokensRequest, DiscountNotificationRequest, RequestMatchNotificationRequest } from 'src/types';
import { NotifService } from '../../services/NotifService';
import { UserModel } from '../../models/UserModel';

@JsonController('notif/')
export class NotifController {
    private notifService: NotifService;

    constructor(notifService: NotifService) {
      this.notifService = notifService;
    }

    @Get('recent')
    async getRecentNotifications(@CurrentUser() user: UserModel) {
      return this.notifService.getRecentNotifications(user.id);
    }

    @Post()
    async sendNotif(@Body() findTokensRequest: FindTokensRequest) {
      return this.notifService.sendNotifs(findTokensRequest);
    }

    @Post('discount')
    async sendDiscountNotif(@Body() discountRequest: DiscountNotificationRequest) {
        return this.notifService.sendDiscountNotification(discountRequest);
    }

    @Post('request-match')
    async sendRequestMatchNotif(@Body() matchRequest: RequestMatchNotificationRequest) {
        return this.notifService.sendRequestMatchNotification(matchRequest);
    }
}
