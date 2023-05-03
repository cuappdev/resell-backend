import { Body, CurrentUser, Get, JsonController, Param, Params, Post } from 'routing-controllers';

import { UserModel } from '../../models/UserModel';
import { UserService } from '../../services/UserService';
import { EditProfileRequest, GetUserByEmailRequest, GetUserResponse, GetUsersResponse, SaveTokenRequest, SetAdminByEmailRequest } from '../../types';
import { UuidParam } from '../validators/GenericRequests';

@JsonController('user/')
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Get()
  async getUsers(@CurrentUser() user: UserModel): Promise<GetUsersResponse> {
    const users = await this.userService.getAllUsers(user);
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

  @Post('admin/')
  async setAdmin(@Body() setAdminByEmailRequest: SetAdminByEmailRequest, @CurrentUser() superAdmin: UserModel): Promise<GetUserResponse> {
    return { user: await this.userService.setAdmin(superAdmin, setAdminByEmailRequest) };
  }

  // @Post('token/')
  // async saveToken(@Body() saveTokenRequest: SaveTokenRequest): Promise<GetUserResponse> {
  //   return { user: await this.userService.saveToken(saveTokenRequest) };
  // }
}