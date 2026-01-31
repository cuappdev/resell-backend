import * as faker from "faker";

import { PostModel } from "../../models/PostModel";
import { CategoryModel } from "../../models/CategoryModel";
import { FactoryUtils } from "./FactoryUtils";

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

    const category1 = new CategoryModel();
    category1.id = "a2b2c3d4-e5f6-7890-abcd-1234567890ef";
    category1.name = "CLOTHING";
    category1.posts = [];

    const category2 = new CategoryModel();
    category2.id = "f4c9ad85-9015-45b1-b52f-5d7402313887";
    category2.name = "HANDMADE";
    category2.posts = [];

    const fakePost = new PostModel();
    fakePost.id = "81e6896c-a549-41bf-8851-604e7fbd4f1f";
    fakePost.title = "Mateo's Kombucha";
    fakePost.description = "Fermented since o-week";
    fakePost.archive = false;
    fakePost.categories = [category1, category2];
    fakePost.condition = "NEW";
    fakePost.original_price = 500.15;
    fakePost.altered_price = -1;
    fakePost.images = [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Kombucha_Mature.jpg/640px-Kombucha_Mature.jpg",
      "https://images.heb.com/is/image/HEBGrocery/001017916",
    ];
    fakePost.location = "The Dorm Hotel";
    fakePost.sold = false;

    return fakePost;
  }

  public static fake(): PostModel {
    /**
     * Returns a PostModel with random values in its instance variables
     *
     * @returns The PostModel object with random values in its instance variables
     */

    const category1 = new CategoryModel();
    category1.id = "f4c9ad85-9015-45b1-b52f-5d7402313887";
    category1.name = "HANDMADE";
    category1.posts = [];

    const category2 = new CategoryModel();
    category2.id = "a2b2c3d4-e5f6-7890-abcd-1234567890ef";
    category2.name = "CLOTHING";
    category2.posts = [];

    const fakePost = new PostModel();
    fakePost.id = faker.datatype.uuid();
    fakePost.title = faker.vehicle.bicycle();
    fakePost.description = faker.vehicle.color();
    fakePost.archive = false;
    fakePost.categories = [category1, category2];
    fakePost.condition = "NEW";
    fakePost.original_price = Number(faker.commerce.price(100, 400));
    fakePost.altered_price = -1;
    fakePost.images = [faker.internet.url()];
    fakePost.location = faker.address.city();
    fakePost.sold = false;

    return fakePost;
  }
}
