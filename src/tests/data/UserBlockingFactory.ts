import * as faker from 'faker';

import { UserBlockingModel } from '../../models/UserBlockingModel';
import { UserModel } from '../../models/UserModel';
import { UserFactory } from '../data/UserFactory';
import { FactoryUtils } from './FactoryUtils';

export class UserBlockingFactory {
  public static create(n: number): UserBlockingModel[] {
    /**
     * Returns a list of n number of random UserModel objects
     * 
     * @param n The number of desired random UserModel objects
     * @returns The list of n number of random UserModel objects
     */
    return FactoryUtils.create(n, UserBlockingFactory.fake);
  }
  public static fakeTemplate(): UserBlockingModel {
    /**
     * Returns a predefined UserBlocking object. Useful for testing
      * specific instance variables since we already know the value of them
      * 
      * @returns The predefined UserBlocking object, look at UserBlockingFactory.ts
      * for exact details
     */
    const fakeUserModel = new UserBlockingModel();
    fakeUserModel.blockingUser = UserFactory.fakeTemplate();
    fakeUserModel.blockedUser = UserFactory.fakeTemplate2();
    return fakeUserModel;
  }

  public static fake(): UserBlockingModel {
    /**
     * Returns a UserBlocking with random values in its instance variables
     * 
     * @returns The UserBlocking object with random values in its instance variables
     */
    const fakeUserModel = new UserBlockingModel();
    fakeUserModel.blockedUser = UserFactory.fake();
    fakeUserModel.blockingUser = UserFactory.fake();
    return fakeUserModel;
  }
}