import {
  JsonController, Params, Get, Post, Delete, UseBefore, Body, BodyParam,
} from 'routing-controllers';
import { UserModel } from '../../models/UserModel'
import { UserService } from '../../services/UserService';
import { Inject } from 'typedi';
import {
  GetUsersResponse,
  GetUserResponse,
  CreateUserRequest,
  Uuid,
  GenericSuccessResponse,
} from '../../types';
import { EmailParam, UuidParam } from '../validators/GenericRequests';

// import { UserAuthentication } from '../middleware/UserAuthentication';
// import { AuthenticatedUser } from '../decorators/AuthenticatedUser';

// @UseBefore(UserAuthentication)
@JsonController('user/')
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Get()
  async getUsers(): Promise<GetUsersResponse> {
    const users = await this.userService.getAllUsers();
    return { error: null, users: users.map((user) => user.getUserProfile()) };
  }

  @Get('id/:id/')
  async getUserById(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { error: null, user: await this.userService.getUserById(params.id) };
  }
  
  @Get('googleId/:id/')
  async getUserByGoogleId(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { error: null, user: await this.userService.getUserByGoogleId(params.id) };
  }

  @Get('postId/:id/')
    async getUserByPostId(@Params() params: UuidParam): Promise<GetUserResponse> {
      return { error: null, user: await this.userService.getUserByPostId(params.id) }; 
    }

  @Get('email/:email/')
  async getUserByEmail(@Params() params: EmailParam): Promise<GetUserResponse> {
    return { error: null, user: await this.userService.getUserByEmail(params.email) }; 
  }
  
  @Post()
  async createUser(@Body() createUserRequest: CreateUserRequest): Promise<GetUserResponse> {
    const user = await this.userService.createUser(createUserRequest);
    return { error: null, user: user };
  }

  @Delete('id/:id/')
  async deleteUserById(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { error: null, user: await this.userService.deleteUserById(params.id) };
  }
}