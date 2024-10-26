import { Body, CurrentUser, Get, JsonController, Param, Params, Post, Delete} from 'routing-controllers';

import { UserModel } from '../../models/UserModel';
import { UserService } from '../../services/UserService';
import { BlockUserRequest, UnblockUserRequest, EditProfileRequest, GetUserByEmailRequest, GetUserResponse, GetUsersResponse, SaveTokenRequest, SetAdminByEmailRequest } from '../../types';
import { UuidParam } from '../validators/GenericRequests';
import { OpenAPI } from 'routing-controllers-openapi';

@JsonController('user/')
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Get()
  @OpenAPI({
    summary: 'Get all users',
    description: 'Retrieves all users',
    responses: {
      '200': { description: 'Users returned successfully' },
    }
  })
  async getUsers(@CurrentUser() user: UserModel): Promise<GetUsersResponse> {
    const users = await this.userService.getAllUsers(user);
    return { users: users.map((user) => user.getUserProfile()) };
  }

  @Post()
  @OpenAPI({
    summary: 'Create new user',
    description: 'Creates a new user',
    responses: {
      '200': { description: 'User created successfully' },
    }
  })
  async editProfile(@Body({ options: { limit: process.env.UPLOAD_SIZE_LIMIT } }) editProfileRequest: EditProfileRequest, @CurrentUser() user: UserModel): Promise<GetUserResponse> {
    return { user: await this.userService.updateUser(editProfileRequest, user) };
  }

  @Get('id/:id/')
  @OpenAPI({
    summary: 'Get user by id',
    description: 'Retrieves a user by its id',
    responses: {
      '200': { description: 'User returned successfully' },
      '404': { description: 'User not found' }
    }
  })
  async getUserById(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { user: await this.userService.getUserById(params) };
  }

  @Get('googleId/:id/')
  @OpenAPI({
    summary: 'Get user by google id',
    description: 'Retrieves a user by its google id',
    responses: {
      '200': { description: 'User returned successfully' },
      '404': { description: 'User not found' }
    }
  })
  async getUserByGoogleId(@Param("id") id: string): Promise<GetUserResponse> {
    return { user: await this.userService.getUserByGoogleId(id) };
  }

  @Get('postId/:id/')
  @OpenAPI({
    summary: 'Get user by post id',
    description: 'Retrieves a user by its post id',
    responses: {
      '200': { description: 'User returned successfully' },
      '404': { description: 'User not found' }
    }
  })
  async getUserByPostId(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { user: await this.userService.getUserByPostId(params) };
  }

  @Post('email/')
  @OpenAPI({
    summary: 'Get user by email',
    description: 'Retrieves a user by its email',
    responses: {
      '200': { description: 'User returned successfully' },
      '404': { description: 'User not found' }
    }
  })
  async getUserByEmail(@Body() getUserByEmailRequest: GetUserByEmailRequest): Promise<GetUserResponse> {
    return { user: await this.userService.getUserByEmail(getUserByEmailRequest.email) };
  }

  @Post('admin/')
  @OpenAPI({
    summary: 'Set admin',
    description: 'Sets a user as an admin',
    responses: {
      '200': { description: 'User set as admin successfully' },
    }
  })
  async setAdmin(@Body() setAdminByEmailRequest: SetAdminByEmailRequest, @CurrentUser() superAdmin: UserModel): Promise<GetUserResponse> {
    return { user: await this.userService.setAdmin(superAdmin, setAdminByEmailRequest) };
  }

  @Post('block/')
  @OpenAPI({
    summary: 'Block user',
    description: 'Blocks a user',
    responses: {
      '200': { description: 'User blocked successfully' },
    }
  })
  async blockUser(@Body() blockUserRequest: BlockUserRequest, @CurrentUser() user: UserModel): Promise<GetUserResponse> {
    return { user: await this.userService.blockUser(user, blockUserRequest) }
  }

  @Post('unblock/')
  @OpenAPI({
    summary: 'Unblock user',
    description: 'Unblocks a user',
    responses: {
      '200': { description: 'User unblocked successfully' },
    }
  })
  async unblockUser(@Body() unblockUserRequest: UnblockUserRequest, @CurrentUser() user: UserModel): Promise<GetUserResponse> {
    return { user: await this.userService.unblockUser(user, unblockUserRequest) }
  }

  @Get('blocked/id/:id/')
  @OpenAPI({
    summary: 'Get blocked users by id',
    description: 'Retrieves all blocked users by a user id',
    responses: {
      '200': { description: 'Users returned successfully' },
      '404': { description: 'Users not found' }
    }
  })
  async getBlockedUsersById(@Params() params: UuidParam): Promise<GetUsersResponse> {
    return { users: await this.userService.getBlockedUsersById(params) };
  }

  @Delete('id/:id/')
  @OpenAPI({
    summary: 'Delete user',
    description: 'Deletes a user by its id',
    responses: {
      '200': { description: 'User deleted successfully' },
      '404': { description: 'User not found' }
    }
  })
  async deleteUser(@Params() params: UuidParam, @CurrentUser() user: UserModel): Promise<GetUserResponse> {
    return { user: await this.userService.deleteUser(user, params) };
  }

  @Post('softDelete/id/:id/')
  @OpenAPI({
    summary: 'Soft delete user',
    description: 'Soft deletes a user by its id',
    responses: {
      '200': { description: 'User soft deleted successfully' },
      '404': { description: 'User not found' }
    }
  })
  async softDeleteUser(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { user: await this.userService.softDeleteUser(params) };
  }
}