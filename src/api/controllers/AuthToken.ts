import { Body, Get, JsonController } from 'routing-controllers';
import { getAuth } from "firebase-admin/auth";
import { AuthTokenResponse, FcmTokenRequest } from '../../types';

@JsonController('authToken/')
export class AuthTokenController {

  @Get() async authorize(@Body() fcmToken: FcmTokenRequest): Promise<AuthTokenResponse> {
  try {
    const customToken = await getAuth().createCustomToken(fcmToken.token);
    
    const response = await fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyDoA6LS50__vx9PsHk_olqlM_CInjJnG7o',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: customToken,
          returnSecureToken: true,
        }),
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to sign in: ${error}`);
    }
    
    const res = await response.json();
    console.log(res.idToken);

    const idToken = res.idToken;
    return { token: idToken };
  } catch (error) {
    console.error('Error creating or exchanging custom token:', error);
    throw error; 
  }
}

}