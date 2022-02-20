import {
    JsonController, Params, Get, Post, Delete, UseBefore, Body, Param,
  } from 'routing-controllers';
  import { UserModel } from '../../models/UserModel'
  import { AuthService } from '../../services/AuthService';
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
  @JsonController('auth/')
  export class AuthController {
    private authService: AuthService;
  
    constructor(authService: AuthService) {
      this.authService = authService;
    }
    
    @Post()
    async createUser(@Body() createUserRequest: CreateUserRequest): Promise<GetUserResponse> {
      const user = await this.authService.createUser(createUserRequest);
      return { error: null, user: user };
    }
  
    @Delete('id/:id/')
    async deleteUserById(@Params() params: UuidParam): Promise<GetUserResponse> {
      return { error: null, user: await this.authService.deleteUserById(params.id) };
    }
  }