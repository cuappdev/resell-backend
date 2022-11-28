import * as faker from 'faker';

import { UserSessionModel } from '../../models/UserSessionModel';
import { FactoryUtils, TimeUnits } from './FactoryUtils';

export class UserSessionFactory {  
    public static create(n: number): UserSessionModel[] {
        /**
         * Returns a list of n number of random UserSessionModel objects
         * 
         * @param n The number of desired random UserSessionModel objects
         * @returns The list of n number of random UserSessionModel objects
         */
        return FactoryUtils.create(n, UserSessionFactory.fake);
    }

    public static fakeTemplate(): UserSessionModel {
        /**
         * Returns a predefined UserSessionModel object. Useful for testing
         * specific instance variables since we already know the value of them
         * 
         * @returns The predefined UserSessionModel object, look at UserSessionFactory.ts
         * for exact details
         */
        const fakeUserSession = new UserSessionModel();
        fakeUserSession.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';
        fakeUserSession.accessToken = 'accessToken';
        // new Date object contains current time + 5 minutes
        fakeUserSession.expiresAt = new Date((new Date()).getTime() + FactoryUtils.getTimeInMilliseconds(5, TimeUnits.Minutes));

        return fakeUserSession;
    }
  
    public static fake(): UserSessionModel {
        /**
         * Returns a UserSessionModel with random values in its instance variables
         * 
         * @returns The UserSessionModel object with random values in its instance variables
         */
        const fakeUserSession = new UserSessionModel();
        fakeUserSession.id = faker.datatype.uuid();
        fakeUserSession.update();

        return fakeUserSession;
    }
}