import { Factory, Seeder } from 'typeorm-seeding';
import { UserModel } from '../models/UserModel';
import { PostModel } from '../models/PostModel';
import { FeedbackModel } from '../models/FeedbackModel';
import { UserReviewModel } from '../models/UserReviewModel';
import { ReportModel } from '../models/ReportModel';
import { RequestModel } from '../models/RequestModel';
import { TransactionModel } from '../models/TransactionModel';
import { getRepository } from 'typeorm';

export default class SeedInitialData implements Seeder {
  public async run(factory: Factory): Promise<void> {
    if (process.env.IS_PROD?.toLowerCase() === "true") {
      console.log('Skipping seeding, not in development environment');
      return;
    }

    // Reset the data: delete all users, posts, feedback, reviews, reports, and requests
    const userRepository = getRepository(UserModel);
    const postRepository = getRepository(PostModel);
    const feedbackRepository = getRepository(FeedbackModel);
    const userReviewRepository = getRepository(UserReviewModel);
    const reportRepository = getRepository(ReportModel);
    const requestRepository = getRepository(RequestModel);
    const transactionRepository = getRepository(TransactionModel);

    await transactionRepository.delete({});
    await requestRepository.delete({});
    await reportRepository.delete({});
    await userReviewRepository.delete({});
    await feedbackRepository.delete({});
    await postRepository.delete({});
    await userRepository.delete({});
    console.log(' - Deleted all existing users, posts, feedback, reviews, reports, requests, and transactions');

    // Create users, posts, feedback, reviews, reports, and requests
    const users = [];
    const posts = [];
    for (let i = 1; i <= 5; i++) {
      const user = await factory(UserModel)({ index: i }).create();
      users.push(user);

      // Create posts for users with an odd index
      if (i % 2 !== 0) {
        for (let j = 1; j <= 2; j++) {
          const post = await factory(PostModel)({ index: j, user }).create();
          posts.push(post);
        }
      }

      // Create two feedback entries for each user
      for (let k = 1; k <= 2; k++) {
        await factory(FeedbackModel)({ index: k, user }).create();
      }
    }

    // Create user reviews for each even-indexed user and the preceding user
    for (let i = 2; i <= users.length; i += 2) {
      await factory(UserReviewModel)({ index: i, buyer: users[i - 2], seller: users[i - 1] }).create();
    }

    // Create reports for users with even indexes
    for (let i = 2; i <= users.length; i += 2) {
      await factory(ReportModel)({
        index: i,
        reporter: users[i - 2],
        reported: users[i - 1],
        post: i % 3 === 0 ? null : await factory(PostModel)({ index: 1, user: users[i - 2] }).create(),
        message: i % 3 !== 0 ? null : undefined
      }).create();
    }

    // Create requests for each user
    for (let i = 1; i <= users.length; i++) {
      const user = users[i - 1];
      for (let j = 1; j <= 2; j++) {
        await factory(RequestModel)({ index: j, user }).create();
      }
    }

    // Create transactions for half of the posts
    const halfPostCount = Math.floor(posts.length / 2);
    for (let i = 0; i < halfPostCount; i++) {
      const post = posts[i];
      const buyer = users[(i + 1) % users.length]; // Select a buyer (cyclically)
      const seller = post.user; // Seller is the post owner

      await factory(TransactionModel)({
        index: i + 1,
        buyer,
        seller,
        post,
      }).create();
    }
  }
}
