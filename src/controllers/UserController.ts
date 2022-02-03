import {
  JsonController, Params, Get, Post, Patch, UseBefore, Body, BodyParam,
} from 'routing-controllers';
import UserModel from '../models/UserModel'
import UserService from '../services/UserService';
import { Inject } from 'typedi';
import {
  GetAllUsersResponse,
  GetUserResponse,
  PostUserRequest,
} from '../types';

// import { UserAuthentication } from '../middleware/UserAuthentication';
// import { AuthenticatedUser } from '../decorators/AuthenticatedUser';

// @UseBefore(UserAuthentication)
@JsonController('user/')
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  // @Get()
  // async helloWorldName(@BodyParam("name") name: string): Promise<string> {
  //   return "Hello world, ".concat(name, "!");
  // }

  @Get()
  async getUsers(): Promise<GetAllUsersResponse> {
    const users = await this.userService.getAllUsers();
    return { error: null, users: users.map((user) => user.getUserProfile()) };
  }

  @Post()
  async postUser(@Body() postUserRequest: PostUserRequest): Promise<GetUserResponse> {
    const user = await this.userService.postUser(postUserRequest);
    return { error: null, user: user };
  }
}