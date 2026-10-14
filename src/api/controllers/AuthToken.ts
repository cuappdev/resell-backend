import { BadRequestError, Body, Get, JsonController, Post, UseBefore } from "routing-controllers";
import { localAuthOnly } from "../middlewares/LocalAuthOnly";
import { getAuth } from "firebase-admin/auth";
import {
  AuthTokenResponse,
  emailAndPass,
  FcmTokenRequest,
  UIDResponse,
} from "../../types";

@JsonController("authToken/")
@UseBefore(localAuthOnly)
export class AuthTokenController {
  @Post("create/") async createAccount(
    @Body() info: emailAndPass,
  ): Promise<UIDResponse> {
    const userCredential = await getAuth().createUser({
      email: info.email,
      password: info.password,
    });

    // Firebase automatically generates a UID for this user!
    const uid = userCredential.uid;
    console.log("New user's UID:", uid);
    return { uid: uid };
  }

  @Get() async authorize(
    @Body() fcmToken: FcmTokenRequest,
  ): Promise<AuthTokenResponse> {
    return this.issueToken(fcmToken?.token);
  }

  @Post() async localToken(
    @Body() body: { uid: string },
  ): Promise<AuthTokenResponse> {
    return this.issueToken(body?.uid);
  }

  private async issueToken(uid: string): Promise<AuthTokenResponse> {
    if (typeof uid !== "string" || !uid.trim() || uid.length > 128) {
      throw new BadRequestError("Provide a Firebase UID (1–128 characters)");
    }
    try {
      // Require an existing test user; avoid creating users as a side effect.
      await getAuth().getUser(uid);
      const customToken = await getAuth().createCustomToken(uid);

      const response = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyDoA6LS50__vx9PsHk_olqlM_CInjJnG7o",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: customToken,
            returnSecureToken: true,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to sign in: ${error}`);
      }

      const res = await response.json();

      const idToken = res.idToken;
      return { token: idToken };
    } catch (error) {
      console.error("Error creating or exchanging custom token:", error);
      throw error;
    }
  }
}
