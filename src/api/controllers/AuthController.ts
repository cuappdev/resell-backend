import { Body, Delete, JsonController, Params, Post } from 'routing-controllers';

import { AuthService } from '../../services/AuthService';
import { CreateUserRequest, ErrorResponse, getErrorMessage, GetUserResponse } from '../../types';
import { UuidParam } from '../validators/GenericRequests';

@JsonController('auth/')
export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }
  
  @Post()
  async createUser(@Body() createUserRequest: CreateUserRequest): Promise<GetUserResponse | ErrorResponse> {
    try {
      const user = await this.authService.createUser(createUserRequest);
      return { success: true, user: user };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) }
    }
  }

  @Delete('id/:id/')
  async deleteUserById(@Params() params: UuidParam): Promise<GetUserResponse | ErrorResponse> {
    try {
      return { success: true, user: await this.authService.deleteUserById(params.id) };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) }
    }
  }
}