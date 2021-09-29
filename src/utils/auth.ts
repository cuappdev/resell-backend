import { LoginTicket, OAuth2Client, TokenPayload } from 'google-auth-library';

// Oauth code from https://developers.google.com/identity/sign-in/web/backend-auth
const client: OAuth2Client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

export async function verify(token: string): Promise<TokenPayload | undefined> {
  try {
    const ticket: LoginTicket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.OAUTH_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (payload === undefined) {
      console.log("Could not verify user!");
    }
    return payload;
  }
  catch (e) {
    console.log("Invalid OAuth token - could not verify user!");
    return undefined;
  }
}