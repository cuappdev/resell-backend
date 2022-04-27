import { Body, CurrentUser, Get, JsonController, NotFoundError, Params, Post } from 'routing-controllers';

import { UserModel } from '../../models/UserModel';
import { UserService } from '../../services/UserService';
import { EditProfileRequest, GetPostResponse, GetUserByEmailRequest, GetUserResponse, GetUsersResponse } from '../../types';
import { PostAndUserUuidParam, UuidParam } from '../validators/GenericRequests';

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
  async editProfile(@Body() editProfileRequest: EditProfileRequest, @CurrentUser() user?: UserModel): Promise<GetUserResponse> {
    if (!user) throw new NotFoundError("User not found!");
    const editedUser = await this.userService.updateUser(editProfileRequest, user);
    return { user: editedUser.getUserProfile() };
  }
  
  @Get('id/:id/')
  async getUserById(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { user: await this.userService.getUserById(params) };
  }
  
  @Get('googleId/:id/')
  async getUserByGoogleId(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { user: await this.userService.getUserByGoogleId(params) };
  }

  @Get('postId/:id/')
  async getUserByPostId(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { user: await this.userService.getUserByPostId(params) }; 
  }

  @Get('save/userId/:userId/postId/:postId/') 
  async savePost(@Params() params: PostAndUserUuidParam): Promise<GetPostResponse> {
    return { post: await this.userService.savePost(params) }; 
  }

  @Get('unsave/userId/:userId/postId/:postId/') 
  async unsavePost(@Params() params: PostAndUserUuidParam): Promise<GetPostResponse> {
      return { post: await this.userService.unsavePost(params) };
  }

  @Post('email/')
  async getUserByEmail(@Body() getUserByEmailRequest: GetUserByEmailRequest): Promise<GetUserResponse> {
    return { user: await this.userService.getUserByEmail(getUserByEmailRequest.email) };
  }
}