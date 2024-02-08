import * as faker from 'faker';

import { BlockingModel } from '../../models/BlockingModel';
import { UserModel } from '../../models/UserModel';
import { UserFactory } from '../data/UserFactory';
import { FactoryUtils } from './FactoryUtils';

export class BlockingFactory {
  public static create(n: number): BlockingModel[] {
    /**
     * Returns a list of n number of random Blocking objects
     * 
     * @param n The number of desired random Blocking objects
     * @returns A list of n number of random Blocking objects
     */
    return FactoryUtils.create(n, BlockingFactory.fake);
  }
  public static fakeTemplate(): BlockingModel {
    /**
     * Returns a predefined UserBlocking object. Useful for testing
     * specific instance variables since we already know the value of them
     * 
     * @returns The predefined UserBlocking object, look at BlockingFactory.ts
     */
    const fakeBlockingModel = new BlockingModel();
    fakeBlockingModel.blocker = UserFactory.fakeTemplate();
    fakeBlockingModel.blocked = UserFactory.fakeTemplate2();
    return fakeBlockingModel;
  }

  public static fake(): BlockingModel {
    /**
     * Returns a UserBlocking with random values in its instance variables
     * 
     * @returns The UserBlocking object with random values in its instance
     */
    const fakeBlockingModel = new BlockingModel();
    fakeBlockingModel.blocker = UserFactory.fake();
    fakeBlockingModel.blocked = UserFactory.fake();
    return fakeBlockingModel;
  }
}