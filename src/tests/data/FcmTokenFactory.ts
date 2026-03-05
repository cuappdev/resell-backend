import * as faker from "faker";

import { FcmTokenModel } from "../../models/FcmTokenModel";
import { FactoryUtils } from "./FactoryUtils";
export class FcmTokenFactory {
  public static create(n: number): FcmTokenModel[] {
    /**
     * Returns a list of n number of random FcmTokenModel objects
     *
     * @param n The number of desired random FcmTokenModel objects
     * @returns The list of n number of random FcmTokenModel objects
     */
    return FactoryUtils.create(n, FcmTokenFactory.fake);
  }

  public static fakeTemplate(): FcmTokenModel {
    /**
     * Returns a predefined FcmTokenModel object. Useful for testing
     * specific instance variables since we already know the value of them
     *
     * @returns The predefined FcmTokenModel object, look at FcmTokenFactory.ts
     * for exact details
     */
    const fakeFcmToken = new FcmTokenModel();
    fakeFcmToken.id = "1e900348-df68-42b3-a8c9-270205575314";
    fakeFcmToken.fcmToken = "1234567890";
    fakeFcmToken.notificationsEnabled = true;
    fakeFcmToken.timestamp = new Date("2023-01-01T00:00:00Z");

    return fakeFcmToken;
  }

  public static fake(): FcmTokenModel {
    /**
     * Returns a FcmTokenModel with random values in its instance variables
     *
     * @returns The FcmTokenModel object with random values in its instance variables
     */
    const fakeFcmToken = new FcmTokenModel();
    fakeFcmToken.id = faker.datatype.uuid();
    fakeFcmToken.fcmToken = faker.datatype.uuid();
    fakeFcmToken.notificationsEnabled = true;
    fakeFcmToken.timestamp = new Date();

    return fakeFcmToken;
  }
}
