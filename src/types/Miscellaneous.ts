export type APIUserSession = {
    userId: string,
    accessToken: string,
    active: boolean,
    expiresAt: number,
    refreshToken: string,
  }