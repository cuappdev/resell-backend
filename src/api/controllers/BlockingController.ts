import { Body, CurrentUser, Get, JsonController, Param, Params, Post, Delete } from 'routing-controllers';
import { UserModel } from '../../models/UserModel';
import { BlockingModel } from '../../models/BlockingModel';
import { BlockingService } from '../../services/BlockingService';
import { UuidParam, UuidParams } from '../validators/GenericRequests';
import { GetBlockingResponse, GetBlockingsResponse } from 'src/types';

@JsonController('block/')
export class BlockingController {
  private blockingService: BlockingService;

  constructor(blockingService: BlockingService) {
    this.blockingService = blockingService;
  }

  @Get()
  async getAllBlockings(@CurrentUser() user: UserModel): Promise<GetBlockingsResponse> {
    return { blockings: await this.blockingService.getAllBlockings(user) };
  }

  @Get('blocker/:id')
  async getBlockingsByBlockerId(@CurrentUser() user: UserModel, @Params() params: UuidParam): Promise<GetBlockingsResponse> {
    return { blockings: await this.blockingService.getBlockingByBlockerId(user, params) };
  }

  @Post('block/:id1/:id2')
  async blockUser(@CurrentUser() user: UserModel, @Params() params: UuidParams): Promise<GetBlockingResponse> {
    return { blocking: await this.blockingService.blockUser(user, params) };
  }

  @Delete('block/:id1/:id2')
  async unblockUser(@CurrentUser() user: UserModel, @Params() params: UuidParams): Promise<void> {
    return await this.blockingService.unblockUser(user, params) 
  };
}