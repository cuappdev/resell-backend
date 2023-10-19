import { Body, CurrentUser, Get, JsonController, Param, Params, Post, Delete } from 'routing-controllers';

import { UserModel } from '../../models/UserModel'
import { UserBlocking } from '../../models/UserBlockingModel';
import { UserBlockingService } from '../../services/UserBlockingService';
import { UuidParam, UuidParams } from '../validators/GenericRequests'
import { GetUserBlockingResponse, GetUserBlockingsResponse } from 'src/types';

@JsonController('block/')
export class UserBlockingController {
  private userBlockingService: UserBlockingService;

  constructor(userBlockingService: UserBlockingService) {
    this.userBlockingService = userBlockingService;
  }

  @Get()
  async getUserBlockings(@CurrentUser() user: UserModel): Promise<GetUserBlockingsResponse> {
    return { blockings: await this.userBlockingService.getAllUserBlockings(user) };
  }

  @Get('id/:id')
  async getUserBlockingById(@Params() params: UuidParam): Promise<GetUserBlockingResponse> {
    return { blocking: await this.userBlockingService.getUserBlockingById(params) }
  }

  @Get('userBlockingId/:id')
  async getUserBlockingsByBlockingId(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetUserBlockingsResponse> {
    return { blockings: await this.userBlockingService.getAllUserBlockingsByBlockingUserId(user, params) }
  }

  @Get('userBlockedId/:id')
  async getUserBlockingsByBlockedId(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetUserBlockingsResponse> {
    return { blockings: await this.userBlockingService.getAllUserBlockingsByBlockedUserId(user, params) }
  }

  @Get('userIds/:id1/:id2')
  async getUserBlockingByBothIds(@Params() params: UuidParams): Promise<GetUserBlockingResponse> {
    return { blocking: await this.userBlockingService.getUserBlockingByBothIds(params) }
  }

  @Post('userIds/:id1/:id2')
  async blockUser(@Params() params: UuidParams): Promise<GetUserBlockingResponse> {
    return { blocking: await this.userBlockingService.blockUser(params.id1, params.id2) }
  }

  @Delete('userIds/:id1/:id2')
  async unblockUser(@CurrentUser() user: UserModel, @Params() params: UuidParams): Promise<void> {
    return await this.userBlockingService.unblockUser(user, params.id1, params.id2)
  }
}
