import * as faker from 'faker';

import { UserSessionModel } from '../../models/UserSessionModel';
import FactoryUtils from './FactoryUtils';

export class UserSessionFactory {  
    public static create(n: number): UserSessionModel[] {
      return FactoryUtils.create(n, UserSessionFactory.fake);
    }

    public static fakeTemplate(): UserSessionModel {
        const fakeUserSession = new UserSessionModel();
        fakeUserSession.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';
        fakeUserSession.accessToken = 'accessToken';
        // new Date object contains current time, 60000 * 5 is 5 minutes in milliseconds
        fakeUserSession.expiresAt = new Date((new Date()).getTime() + 60000 * 5); 

        return fakeUserSession;
    }
  
    public static fake(): UserSessionModel {
        const fakeUserSession = new UserSessionModel();
        fakeUserSession.update();

        return fakeUserSession;
    }
}