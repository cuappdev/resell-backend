export type APIUserSession = {
    userId: string,
    accessToken: string,
    refreshToken: string,
    active: boolean,
    expiresAt: number,
    deviceToken: string
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

  export enum Condition {
    GENTLY_USED,
    USED,
    NEVER_USED
}