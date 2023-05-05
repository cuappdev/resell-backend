import * as faker from 'faker';

import { UserReviewModel } from '../../models/UserReviewModel';
import { FactoryUtils} from './FactoryUtils';
export class UserReviewFactory {
    public static create(n: number): UserReviewModel[] {
        /**
         * Returns a list of n number of random UserReviewModel objects
         * 
         * @param n The number of desired random UserReviewModel objects
         * @returns The list of n number of random UserReviewModel objects
         */
        return FactoryUtils.create(n, UserReviewFactory.fake);
    }

    public static fakeTemplate(): UserReviewModel {
        /**
         * Returns a predefined UserReviewModel object. Useful for testing
         * specific instance variables since we already know the value of them
         * 
         * @returns The predefined UserReviewModel object, look at UserReviewFactory.ts
         * for exact details
         */
        const fakeUserReview = new UserReviewModel();
        fakeUserReview.id = '1e900348-df68-42b3-a8c9-270205575314';
        fakeUserReview.fulfilled = false;
        fakeUserReview.stars = 4;
        fakeUserReview.comments = 'Seller arrived late, but very friendly!';

        return fakeUserReview;
    }

    public static fake(): UserReviewModel {
        /**
         * Returns a UserReviewModel with random values in its instance variables
         * 
         * @returns The UserReviewModel object with random values in its instance variables
         */
        const fakeUserReview = new UserReviewModel();
        fakeUserReview.id = faker.datatype.uuid();
        fakeUserReview.fulfilled = false;
        fakeUserReview.stars = faker.datatype.number({ 'min': 0, 'max': 5 });
        fakeUserReview.comments = faker.vehicle.bicycle();

        return fakeUserReview;
    }
}