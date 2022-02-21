import {
  Body, Delete, Get, JsonController, Params, Post,
} from 'routing-controllers';
import { UuidParam } from '../validators/GenericRequests';
import { UserService } from '../../services/UserService';
import {
  CreateUserRequest,
  ErrorResponse,
  GetUserByEmailRequest,
  GetUserResponse,
  GetUsersResponse,
  getErrorMessage,
} from '../../types';

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
      return { success: true, users: users.map((user) => user.getUserProfile()) };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) }
    }
  }

  @Get('id/:id/')
  async getUserById(@Params() params: UuidParam): Promise<GetUserResponse | ErrorResponse> {
    try {
      return { success: true, user: await this.userService.getUserById(params.id) };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) }
    }
    
  }
  
  @Get('googleId/:id/')
  async getUserByGoogleId(@Params() params: UuidParam): Promise<GetUserResponse | ErrorResponse> {
    try {
      return { success: true, user: await this.userService.getUserByGoogleId(params.id) };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) }
    }
  }

  @Get('postId/:id/')
    async getUserByPostId(@Params() params: UuidParam): Promise<GetUserResponse | ErrorResponse> {
      try {
        return { success: true, user: await this.userService.getUserByPostId(params.id) }; 
      } catch (error) {
        return { success: false, error: getErrorMessage(error) }
      }
    }

  @Post('email/')
  async getUserByEmail(@Body() getUserByEmailRequest: GetUserByEmailRequest):
      Promise<GetUserResponse | ErrorResponse> {
    try {
      return { success: true, user: await this.userService.getUserByEmail(getUserByEmailRequest.email) };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) }
    }
  }
  
  @Post()
  async createUser(@Body() createUserRequest: CreateUserRequest): Promise<GetUserResponse | ErrorResponse> {
    try {
      const user = await this.userService.createUser(createUserRequest);
      return { success: true, user: user };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) }
    }
  }

  @Delete('id/:id/')
  async deleteUserById(@Params() params: UuidParam): Promise<GetUserResponse | ErrorResponse> {
    try {
      return { success: true, user: await this.userService.deleteUserById(params.id) };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) }
    }
  }
}