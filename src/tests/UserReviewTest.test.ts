import { UserReviewController } from 'src/api/controllers/UserReviewController';
import { Connection } from 'typeorm';

import { UuidParam } from '../api/validators/GenericRequests';
import { UserReviewModel } from '../models/UserReviewModel';
import { ControllerFactory } from './controllers';
import { DatabaseConnection, DataFactory, UserFactory } from './data';
import { UserReviewFactory } from './data/UserReviewFactory';

let uuidParam: UuidParam;
let expectedUserReview: UserReviewModel;
let conn: Connection;
let userReviewController: UserReviewController;

beforeAll(async () => {
    await DatabaseConnection.connect();
});

beforeEach(async () => {
    await DatabaseConnection.clear();
    conn = await DatabaseConnection.connect();
    userReviewController = ControllerFactory.userReview(conn);

    uuidParam = new UuidParam();
    uuidParam.id = '1e900348-df68-42b3-a8c9-270205575314';

    expectedUserReview = new UserReviewModel();
    expectedUserReview.id = '1e900348-df68-42b3-a8c9-270205575314';
    expectedUserReview.fulfilled = false;
    expectedUserReview.stars = 4
    expectedUserReview.comments = 'Seller arrived late, but very friendly!';
});

afterAll(async () => {
    await DatabaseConnection.clear();
    await DatabaseConnection.close();
});

describe('user review tests', () => {
    test('get all user reviews - no user reviews', async () => {
        const response = await userReviewController.getUserReviews();

        expect(response.reviews).toHaveLength(0);
    });

    test('get all user reviews - one user review', async () => {
        const userReview = UserReviewFactory.fake();
        userReview.buyer = UserFactory.fake();
        userReview.seller = UserFactory.fake();
        await new DataFactory()
            .createUserReviews(userReview)
            .createUsers(userReview.buyer, userReview.seller)
            .write();

        const response = await userReviewController.getUserReviews();

        expect(response.reviews).toHaveLength(1);
    });

    test('get user review by id', async () => {
        const userReview = UserReviewFactory.fakeTemplate();
        userReview.buyer = UserFactory.fakeTemplate();
        userReview.seller = UserFactory.fakeTemplate2();

        await new DataFactory()
            .createUserReviews(userReview)
            .createUsers(userReview.buyer, userReview.seller)
            .write();

        expectedUserReview.buyer = userReview.buyer;
        expectedUserReview.seller = userReview.seller;

        const response = await userReviewController.getUserReviewsById(uuidParam);
        response.review.stars = Number(response.review.stars);
        expectedUserReview.date = response.review.date;
        expect(response.review).toEqual(expectedUserReview);
    });

    test('create user review', async () => {
        const buyer = UserFactory.fakeTemplate();
        const seller = UserFactory.fakeTemplate2();

        await new DataFactory()
            .createUsers(buyer, seller)
            .write();

        const newUserReview = {
            fulfilled: false,
            stars: 4,
            comments: 'Seller arrived late, but very friendly!',
            buyerId: buyer.firebaseUid,
            sellerId: seller.firebaseUid,
        };

        const createResponse = await userReviewController.createUserReview(newUserReview);
        const listResponse = await userReviewController.getUserReviews();

        expect(createResponse.review.comments).toEqual('Seller arrived late, but very friendly!');
        expect(listResponse.reviews).toHaveLength(1);
    });


});