import { IsDefined } from "class-validator";

import { AuthRequest, GoogleLoginUser } from "../../types";

export class LoginRequest implements AuthRequest {
  @IsDefined()
  idToken: string;

  @IsDefined()
  user: GoogleLoginUser;

  @IsDefined()
  deviceToken: string;
}
