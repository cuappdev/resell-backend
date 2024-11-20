import * as faker from 'faker';

import { PostModel } from '../../models/PostModel';
import { FactoryUtils } from './FactoryUtils';

export class PostFactory {
    public static create(n: number): PostModel[] {
        /**
         * Returns a list of n number of random PostModel objects
         * 
         * @param n The number of desired random PostModel objects
         * @returns The list of n number of random PostModel objects
         */
        return FactoryUtils.create(n, PostFactory.fake);
    }

    public static fakeTemplate(): PostModel {
        /**
         * Returns a predefined PostModel object. Useful for testing
         * specific instance variables since we already know the value of them
         * 
         * @returns The predefined PostModel object, look at PostFactory.ts
         * for exact details
         */
        const fakePost = new PostModel();
        fakePost.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';
        fakePost.title = 'Mateo\'s Kombucha';
        fakePost.description = 'Fermented since o-week';
        fakePost.archive = false;
        fakePost.category = 'HANDMADE';
        fakePost.original_price = 500.15;
        fakePost.altered_price = -1;
        fakePost.images = ['https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Kombucha_Mature.jpg/640px-Kombucha_Mature.jpg', 'https://images.heb.com/is/image/HEBGrocery/001017916'];
        fakePost.location = 'The Dorm Hotel';

        return fakePost;
    }

    public static fake(): PostModel {
        /**
         * Returns a PostModel with random values in its instance variables
         * 
         * @returns The PostModel object with random values in its instance variables
         */
        const fakePost = new PostModel();
        fakePost.id = faker.datatype.uuid();
        fakePost.title = faker.vehicle.bicycle();
        fakePost.description = faker.vehicle.color();
        fakePost.archive = false;
        fakePost.category = 'SPORTS & OUTDOORS';
        fakePost.original_price = Number(faker.commerce.price(100, 400));
        fakePost.altered_price = -1;
        fakePost.images = [faker.internet.url()];
        fakePost.location = faker.address.city();

        return fakePost;
    }
}