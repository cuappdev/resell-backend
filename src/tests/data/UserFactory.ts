import * as faker from 'faker';

import { UserModel } from '../../models/UserModel';
import { FactoryUtils } from './FactoryUtils';

export class UserFactory {
    public static create(n: number): UserModel[] {
        /**
         * Returns a list of n number of random UserModel objects
         * 
         * @param n The number of desired random UserModel objects
         * @returns The list of n number of random UserModel objects
         */
        return FactoryUtils.create(n, UserFactory.fake);
    }

    public static fakeTemplate(): UserModel {
        /**
         * Returns a predefined UserModel object. Useful for testing
         * specific instance variables since we already know the value of them
         * 
         * @returns The predefined UserModel object, look at UserFactory.ts
         * for exact details
         */
        const fakeUser = new UserModel();
        fakeUser.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';
        fakeUser.givenName = 'Shungo';
        fakeUser.familyName = 'Najima';
        fakeUser.username = 'snajima';
        fakeUser.netid = 'sn999';
        fakeUser.admin = false;
        fakeUser.photoUrl = 'https://media-exp1.licdn.com/dms/image/C5603AQGmvQtdub6nAQ/profile-displayphoto-shrink_400_400/0/1635358826496?e=1668643200&v=beta&t=ncqjrFUqgqipctcmaSwPzSPrkj0RIQHiCINup_55NNs';
        fakeUser.email = fakeUser.netid + '@cornell.edu';
        fakeUser.googleId = 'shungoGoogleID';
        fakeUser.venmoHandle = "@Shungo-Najima";
        fakeUser.isActive = true;

        return fakeUser;
    }

    public static fakeTemplate2(): UserModel {
        /**
         * Returns another predefined UserModel object. Useful for testing
         * specific instance variables since we already know the value of them
         * 
         * @returns The predefined UserModel object, look at UserFactory.ts
         * for exact details
         */
        const fakeUser = new UserModel();
        fakeUser.id = 'c6f0a14a-48ae-4b1c-bd6f-5f3b7e8c2b99';
        fakeUser.givenName = 'Tony';
        fakeUser.familyName = 'Matchev';
        fakeUser.username = 'tmatchev';
        fakeUser.netid = 'tkm21';
        fakeUser.admin = false;
        fakeUser.photoUrl = 'https://media-exp1.licdn.com/dms/image/C5603AQGmvQtdub6nAQ/profile-displayphoto-shrink_400_400/0/1635358826496?e=1668643200&v=beta&t=ncqjrFUqgqipctcmaSwPzSPrkj0RIQHiCINup_55NNs';
        fakeUser.email = fakeUser.netid + '@cornell.edu';
        fakeUser.googleId = 'tonyGoogleID';
        fakeUser.venmoHandle = "@Tony-Matchev";
        fakeUser.isActive = true;

        return fakeUser;
    }

    public static fake(): UserModel {
        /**
         * Returns a UserModel with random values in its instance variables
         * 
         * @returns The UserModel object with random values in its instance variables
         */
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();

        const fakeUser = new UserModel();
        fakeUser.id = faker.datatype.uuid();
        fakeUser.givenName = firstName;
        fakeUser.familyName = lastName;
        fakeUser.username = faker.internet.userName(firstName, lastName);
        fakeUser.admin = false;
        fakeUser.netid = FactoryUtils.getRandomLetter() + FactoryUtils.getRandomLetter() + FactoryUtils.getRandomNumber(0, 9999);
        fakeUser.photoUrl = faker.internet.url();
        fakeUser.email = fakeUser.netid + '@cornell.edu';
        fakeUser.googleId = faker.datatype.uuid();
        fakeUser.isActive = true;

        return fakeUser;
    }
}