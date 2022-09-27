import * as faker from 'faker';

import { PostModel } from '../../models/PostModel';
import FactoryUtils from './FactoryUtils';

export class PostFactory {  
    public static create(n: number): PostModel[] {
      return FactoryUtils.create(n, PostFactory.fake);
    }

    public static fakeTemplate(): PostModel {
        const fakePost = new PostModel();
        fakePost.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';
        fakePost.title = 'Mateo\'s Kombucha';
        fakePost.description = 'Fermented since o-week';
        fakePost.categories = ['HANDMADE', 'OTHER'];
        fakePost.price = 500.15;
        fakePost.images = ['https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Kombucha_Mature.jpg/640px-Kombucha_Mature.jpg', 'https://images.heb.com/is/image/HEBGrocery/001017916'];
        fakePost.location = 'The Dorm Hotel';

        return fakePost;
    }
  
    public static fake(): PostModel {
        const fakePost = new PostModel();
        fakePost.title = faker.vehicle.bicycle();
        fakePost.description = faker.vehicle.color();
        fakePost.categories = ['SPORTS & OUTDOORS'];
        fakePost.price = Number(faker.commerce.price(100, 400));
        fakePost.images = [faker.internet.url()];
        fakePost.location = faker.address.city();

        return fakePost;
    }
}