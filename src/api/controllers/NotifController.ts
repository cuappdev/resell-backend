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
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['userId', 'title', 'body'],
              properties: {
                userId: {
                  type: 'string',
                  format: 'uuid',
                  example: '381527oejf-42b4-4fdd-b074-dfwbejko229',
                  description: 'ID of the user to receive the notification'
                },
                title: {
                  type: 'string',
                  example: 'New Message',
                  description: 'Title of the notification'
                },
                body: {
                  type: 'string',
                  example: 'You have received a new message from Mateo',
                  description: 'Content of the notification'
                },
                data: {
                  type: 'object',
                  description: 'Additional data to be sent with notification',
                  example: {
                    type: 'message',
                    messageId: '134841-42b4-4fdd-b074-jkfale'
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Notification sent successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Notification sent successfully'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Invalid request body'
        },
        '404': {
          description: 'User not found or no device token available'
        },
        '500': {
          description: 'Failed to send notification'
        }
      }
    })
    async sendNotif(@Body() findTokensRequest: FindTokensRequest) {
      return this.notifService.sendNotifs(findTokensRequest);
    }
}

