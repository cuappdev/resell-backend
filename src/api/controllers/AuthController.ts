import { Body, CurrentUser, Delete, Get, HeaderParam, JsonController, Params, Post } from 'routing-controllers';

import { UserModel } from '../../models/UserModel';
import { AuthService } from '../../services/AuthService';
import {
  APIUserSession,
  EditProfileRequest,
  ErrorResponse,
  getErrorMessage,
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
  async currentUser(@CurrentUser({ required: false }) user?: UserModel): Promise<GetUserResponse | ErrorResponse> {
    try {
      if (!user) {
        return { error: 'Invalid session token!' };
      }
      return { user: user.getUserProfile() };
    } catch (error) {
      return { error: getErrorMessage(error) };
    }
  }

  @Post('login/')
  async login(@Body() loginRequest: LoginRequest): Promise<APIUserSession | ErrorResponse> {
    try {
      const session = await this.authService.loginUser(loginRequest);
      if (!session) {
        return { error: 'Invalid credentials' };
      }
      return session.serializeToken();
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Post('logout/')
  async logout(@HeaderParam("authorization") accessToken: string): Promise<LogoutResponse | ErrorResponse> {
    try {
      const success = await this.authService.deleteSessionByAccessToken(accessToken);
      return { logoutSuccess: success };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Post('edit/')
  async editProfile(@Body() editProfileRequest: EditProfileRequest, @CurrentUser() user?: UserModel): Promise<GetUserResponse | ErrorResponse> {
    try {
      if (!user) {
        return { error: 'Invalid session token!' };
      }
      const editedUser = await this.authService.updateUser(editProfileRequest, user);
      return { user: editedUser.getUserProfile() };
    } catch (error) {
      return { error: getErrorMessage(error) };
    }
  }

  @Delete('id/:id/')
  async deleteUserById(@Params() params: UuidParam): Promise<GetUserResponse | ErrorResponse> {
    try {
      return { user: await this.authService.deleteUserById(params.id) };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }

  @Get('sessions/:id/')
  async getSessionsByUserId(@Params() params: UuidParam):
      Promise<GetSessionsReponse | ErrorResponse> {
    try {
      return { sessions: await this.authService.getSessionsByUserId(params.id) };
    } catch (error) {
      return { error: getErrorMessage(error) }
    }
  }
}