import * as faker from 'faker';

import { UserModel } from '../../models/UserModel';
import FactoryUtils from './FactoryUtils';

export class UserFactory {  
    public static create(n: number): UserModel[] {
      return FactoryUtils.create(n, UserFactory.fake);
    }

    public static fakeTemplate(): UserModel {
        const fakeUser = new UserModel();
        fakeUser.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';
        fakeUser.givenName = 'Shungo';
        fakeUser.familyName = 'Najima';
        fakeUser.username = 'snajima';
        fakeUser.netid = 'sn685';
        fakeUser.photoUrl = 'https://media-exp1.licdn.com/dms/image/C5603AQGmvQtdub6nAQ/profile-displayphoto-shrink_400_400/0/1635358826496?e=1668643200&v=beta&t=ncqjrFUqgqipctcmaSwPzSPrkj0RIQHiCINup_55NNs';
        fakeUser.email = fakeUser.netid + '@cornell.edu';
        fakeUser.googleId = 'shungoGoogleID';
        fakeUser.venmoHandle = "@Shungo-Najima";

        return fakeUser;
    }
  
    public static fake(): UserModel {
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();

        const fakeUser = new UserModel();
        fakeUser.givenName = firstName;
        fakeUser.familyName = lastName;
        fakeUser.username = faker.internet.userName(firstName, lastName);
        fakeUser.netid = FactoryUtils.getRandomLetter() + FactoryUtils.getRandomLetter() + FactoryUtils.getRandomNumber(0, 9999);
        fakeUser.photoUrl = faker.internet.url();
        fakeUser.email = fakeUser.netid + '@cornell.edu';
        fakeUser.googleId = faker.datatype.uuid();

        return fakeUser;
    }
}