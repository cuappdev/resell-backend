export type APIUserSession = {
    accessToken: string,
    active: boolean,
    expiresAt: number,
    refreshToken: string,
  }

  export enum Category {
    CLOTHING,
    BOOKS,
    SCHOOL,
    ELECTRONICS,
    HOUSEHOLD,
    HANDMADE,
    SPORTS_AND_OUTDOORS,
    OTHER
}