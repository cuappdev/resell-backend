import { LoginTicket, OAuth2Client } from 'google-auth-library';

// Oauth code from https://developers.google.com/identity/sign-in/web/backend-auth
const client: OAuth2Client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

export async function verify(idToken: string): Promise<LoginTicket | undefined> {
  try {
    const audience = [process.env?.OAUTH_ANDROID_ID, process.env?.OAUTH_BACKEND_ID, process.env?.OAUTH_IOS_ID].map(String);
    return await client.verifyIdToken({
      idToken,
      audience
    });
  }
  catch (e) {
    return undefined;
  }
}