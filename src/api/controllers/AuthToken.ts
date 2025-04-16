import { Body, Get, JsonController } from 'routing-controllers';
import { getAuth } from "firebase-admin/auth";
import { AuthTokenResponse, FcmTokenRequest } from '../../types';
import axios from "axios";
@JsonController('authToken/')
export class AuthTokenController {

  @Get() async authorize(@Body() fcmToken: FcmTokenRequest): Promise<AuthTokenResponse> {
  try {
    const customToken = await getAuth().createCustomToken(fcmToken.token);

    const res = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyDoA6LS50__vx9PsHk_olqlM_CInjJnG7o`,
      {
        token: customToken,
        returnSecureToken: true,
      }
    );

    const idToken = res.data.idToken;
    return { token: idToken };
  } catch (error) {
    console.error('Error creating or exchanging custom token:', error);
    throw error; 
  }
}

}