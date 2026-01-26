import { Body, CurrentUser, JsonController, Post } from "routing-controllers";

import { UserModel } from "../../models/UserModel";
import { AuthService } from "../../services/AuthService";
import { FcmTokenRequest } from "../../types";

@JsonController("auth/")
export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @Post()
  async authorize(
    @CurrentUser() user: UserModel,
    @Body() fcmToken: FcmTokenRequest,
  ): Promise<UserModel | null> {
    return await this.authService.authorize(user, fcmToken.token);
  }
}
