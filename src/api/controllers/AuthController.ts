import {
  Body,
  CurrentUser,
  Delete,
  ForbiddenError,
  Get,
  HeaderParam,
  JsonController,
  Params,
  Post,
} from 'routing-controllers';

import { UserModel } from '../../models/UserModel';
import { AuthService } from '../../services/AuthService';
import { APIUserSession, ErrorResponse, GetSessionsReponse, GetUserResponse, LogoutResponse } from '../../types';
import { LoginRequest } from '../validators/AuthControllerRequests';
import { UuidParam } from '../validators/GenericRequests';

@JsonController('auth/')
export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @Get()
  async currentUser(@CurrentUser({ required: false }) user?: UserModel): Promise<GetUserResponse | ErrorResponse> {
    if (!user) {
      throw new ForbiddenError("Invalid session token");
    }
    return { user: user.getUserProfile() };
  }

  @Post('login/')
  async login(@Body() loginRequest: LoginRequest): Promise<APIUserSession | ErrorResponse> {
    const session = await this.authService.loginUser(loginRequest);
    if (!session) {
      throw new ForbiddenError("Invalid credentials");
    }
    return session.serializeToken();
  }

  @Post('logout/')
  async logout(@HeaderParam("authorization") accessToken: string): Promise<LogoutResponse | ErrorResponse> {
    return { logoutSuccess: await this.authService.deleteSessionByAccessToken(accessToken) };
  }

  @Delete('id/:id/')
  async deleteUserById(@Params() params: UuidParam): Promise<GetUserResponse | ErrorResponse> {
    return { user: await this.authService.deleteUserById(params.id) };
  }

  @Get('sessions/:id/')
  async getSessionsByUserId(@Params() params: UuidParam):
      Promise<GetSessionsReponse | ErrorResponse> {
    return { sessions: await this.authService.getSessionsByUserId(params.id) };
  }
}