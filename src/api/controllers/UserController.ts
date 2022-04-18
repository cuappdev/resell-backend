import { Body, Get, JsonController, Params, Post } from 'routing-controllers';

import { UserService } from '../../services/UserService';
import {
  ErrorResponse,
  getErrorMessage,
  GetPostResponse,
  GetUserByEmailRequest,
  GetUserResponse,
  GetUsersResponse,
} from '../../types';
import { PostAndUserUuidParam, UuidParam } from '../validators/GenericRequests';

@JsonController('user/')
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Get()
  async getUsers(): Promise<GetUsersResponse | ErrorResponse> {
    try {
      const users = await this.userService.getAllUsers();
      return { users: users.map((user) => user.getUserProfile()) };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Get('id/:id/')
  async getUserById(@Params() params: UuidParam): Promise<GetUserResponse | ErrorResponse> {
    try {
      return { user: await this.userService.getUserById(params.id) };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
    
  }
  
  @Get('googleId/:id/')
  async getUserByGoogleId(@Params() params: UuidParam): Promise<GetUserResponse | ErrorResponse> {
    try {
      return { user: await this.userService.getUserByGoogleId(params.id) };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Get('postId/:id/')
  async getUserByPostId(@Params() params: UuidParam): Promise<GetUserResponse | ErrorResponse> {
    try {
      return { user: await this.userService.getUserByPostId(params.id) }; 
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Get('save/userId/:userId/postId/:postId/') 
  async savePost(@Params() params: PostAndUserUuidParam): Promise<GetPostResponse | ErrorResponse> {
    try {
      return { post: await this.userService.savePost(params) }; 
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Get('unsave/userId/:userId/postId/:postId/') 
  async unsavePost(@Params() params: PostAndUserUuidParam): Promise<GetPostResponse | ErrorResponse> {
    try {
      return { post: await this.userService.unsavePost(params) }; 
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Post('email/')
  async getUserByEmail(@Body() getUserByEmailRequest: GetUserByEmailRequest):
      Promise<GetUserResponse | ErrorResponse> {
    try {
      return { user: await this.userService.getUserByEmail(getUserByEmailRequest.email) };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }
}