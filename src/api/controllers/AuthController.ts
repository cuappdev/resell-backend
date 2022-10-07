import { Body, CurrentUser, Delete, Get, HeaderParam, JsonController, Params, Post } from 'routing-controllers';

import { UserModel } from '../../models/UserModel';
import { AuthService } from '../../services/AuthService';
import {
  APIUserSession,
  CreateUserRequest,
  GetSessionReponse,
  GetSessionsReponse,
  GetUserResponse,
  LogoutResponse,
} from '../../types';
import { LoginRequest } from '../validators/AuthControllerRequests';
import { UuidParam } from '../validators/GenericRequests';

@JsonController('auth/')
export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @Get()
  async currentUser(@CurrentUser() user: UserModel): Promise<GetUserResponse> {
    return { user: user.getUserProfile() };
  }

  @Post()
  async createUser(@Body() createUserRequest: CreateUserRequest): Promise<GetUserResponse> {
    return { user: await this.authService.createUser(createUserRequest) };
  }

  @Post('login/')
  async login(@Body() loginRequest: LoginRequest): Promise<APIUserSession> {
    return (await this.authService.loginUser(loginRequest)).serializeToken();
  }

  @Post('logout/')
  async logout(@HeaderParam("authorization") accessToken: string): Promise<LogoutResponse> {
    return { logoutSuccess: await this.authService.deleteSessionByAccessToken(accessToken) };
  }

  @Delete('id/:id/')
  async deleteUserById(@Params() params: UuidParam): Promise<GetUserResponse> {
    return { user: await this.authService.deleteUserById(params) };
  }

  @Get('sessions/:id/')
  async getSessionsByUserId(@Params() params: UuidParam): Promise<GetSessionsReponse> {
    return { sessions: await this.authService.getSessionsByUserId(params) };
  }

  @Get('refresh/')
  async refreshToken(@HeaderParam("authorization") refreshToken: string): Promise<GetSessionReponse> {
    return { session: await this.authService.updateSession(refreshToken) };
  }
}