import { Body, CurrentUser, Get, JsonController, Param, Params, Post } from 'routing-controllers';

import { UserModel } from '../../models/UserModel';
import { UserService } from '../../services/UserService';
import { EditProfileRequest, GetUserByEmailRequest, GetUserResponse, GetUsersResponse } from '../../types';
import { UuidParam } from '../validators/GenericRequests';

@JsonController('user/')
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Get()
  async getUsers(): Promise<GetUsersResponse> {
    const users = await this.userService.getAllUsers();
    return { users: users.map((user) => user.getUserProfile()) };
  }

  @Post()
  async editProfile(@Body({ options: { limit: process.env.UPLOAD_SIZE_LIMIT } }) editProfileRequest: EditProfileRequest, @CurrentUser() user: UserModel): Promise<GetUserResponse> {
    return { user: await this.userService.updateUser(editProfileRequest, user) };
  }
  
  @Get('id/:id/')
  async getUserById(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { user: await this.userService.getUserById(params) };
  }
  
  @Get('googleId/:id/')
  async getUserByGoogleId(@Param("id") id: string): Promise<GetUserResponse> {
    return { user: await this.userService.getUserByGoogleId(id) };
  }

  @Get('postId/:id/')
  async getUserByPostId(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { user: await this.userService.getUserByPostId(params) }; 
  }

  @Post('email/')
  async getUserByEmail(@Body() getUserByEmailRequest: GetUserByEmailRequest): Promise<GetUserResponse> {
    return { user: await this.userService.getUserByEmail(getUserByEmailRequest.email) };
  }
}