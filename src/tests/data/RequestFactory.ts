import * as faker from 'faker';

import { RequestModel } from '../../models/RequestModel';
import { FactoryUtils } from './FactoryUtils';

export class RequestFactory {
    public static create(n: number): RequestModel[] {
        /**
         * Returns a list of n number of random RequestModel objects
         * 
         * @param n The number of desired random RequestModel objects
         * @returns The list of n number of random RequestModel objects
         */
        return FactoryUtils.create(n, RequestFactory.fake);
    }

    public static fakeTemplate(): RequestModel {
        /**
         * Returns a predefined RequestModel object. Useful for testing
         * specific instance variables since we already know the value of them
         * 
         * @returns The predefined RequestModel object, look at PostFactory.ts
         * for exact details
         */
        const fakeRequest = new RequestModel();
        fakeRequest.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';
        fakeRequest.title = 'Textbook';
        fakeRequest.description = 'Textbook for CS 1110';

        return fakeRequest;
    }

    public static fake(): RequestModel {
        /**
         * Returns a RequestModel with random values in its instance variables
         * 
         * @returns The RequestModel object with random values in its instance variables
         */
        const fakePost = new RequestModel();
        fakePost.title = faker.vehicle.bicycle();
        fakePost.description = faker.vehicle.color();

        return fakePost;
    }
}