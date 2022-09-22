export type APIUserSession = {
    userId: string,
    accessToken: string,
    active: boolean,
    expiresAt: number,
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