import { Body, CurrentUser, Delete, Get, JsonController, Param, Params, Post } from 'routing-controllers';
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
    return this.notifService.getRecentNotifications(user.firebaseUid);
  }

  @Get('new')
  async getUnread(@CurrentUser() user: UserModel) {
    return this.notifService.getUnreadNotifications(user.firebaseUid);
  }

  @Get('last7days')
  getLast7Days(@CurrentUser() user: UserModel) {
    return this.notifService.getNotificationsLast7Days(user.firebaseUid);
  }

  @Get('last30days')
  getLast30Days(@CurrentUser() user: UserModel) {
    return this.notifService.getNotificationsLast30Days(user.firebaseUid);
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

  @Delete('id/:id')
  async deleteNotification(@CurrentUser() user: UserModel, @Params() params: { id: string }) {
    return this.notifService.deleteNotification(user.firebaseUid, params.id);
  }

  /**
   * TEST ENDPOINT: Create test notifications for the current user
   * POST /notif/test/:type
   * Types: messages, requests, bookmarks, transactions
   */
  @Post('test/:type')
  async createTestNotification(
    @CurrentUser() user: UserModel,
    @Param('type') type: string
  ) {
    return this.notifService.createTestNotification(user.firebaseUid, type);
  }

  /**
   * Mark a notification as read
   * POST /notif/read/:id
   */
  @Post('read/:id')
  async markAsRead(
    @CurrentUser() user: UserModel,
    @Param('id') notifId: string
  ) {
    return this.notifService.markAsRead(user.firebaseUid, notifId);
  }

  /**
   * Send a transaction confirmation notification to the buyer
   * POST /notif/transaction-confirmation/:transactionId
   */
  @Post('transaction-confirmation/:transactionId')
  async sendTransactionConfirmation(
    @Param('transactionId') transactionId: string
  ) {
    return this.notifService.sendTransactionConfirmationNotification(transactionId);
  }

  /**
   * Check for and send all pending transaction confirmation notifications
   * This can be called by a cron job or manually for testing
   * POST /notif/check-pending-transactions
   */
  @Post('check-pending-transactions')
  async checkPendingTransactions() {
    return this.notifService.sendPendingTransactionConfirmations();
  }
}
