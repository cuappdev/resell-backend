import { Factory, Seeder } from 'typeorm-seeding';
import { UserModel } from '../models/UserModel';
import { PostModel } from '../models/PostModel';
import { FeedbackModel } from '../models/FeedbackModel';
import { UserReviewModel } from '../models/UserReviewModel';
import { ReportModel } from '../models/ReportModel';
import { RequestModel } from '../models/RequestModel';
import { TransactionModel } from '../models/TransactionModel';
import { TransactionReviewModel } from '../models/TransactionReviewModel';
import { CategoryModel } from '../models/CategoryModel';
import { EventTagModel } from '../models/EventTagModel';
import { getRepository } from 'typeorm';
import { NotifModel } from '../models/NotifModel'

export default class SeedInitialData implements Seeder {
  public async run(factory: Factory): Promise<void> {
    if (process.env.IS_PROD?.toLowerCase() === "true") {
      console.log("Skipping seeding, not in development environment");
      return;
    }

    // Reset the data: delete all users, posts, feedback, reviews, reports, requests, transactions, and transaction reviews
    const userRepository = getRepository(UserModel);
    const postRepository = getRepository(PostModel);
    const feedbackRepository = getRepository(FeedbackModel);
    const userReviewRepository = getRepository(UserReviewModel);
    const reportRepository = getRepository(ReportModel);
    const requestRepository = getRepository(RequestModel);
    const transactionRepository = getRepository(TransactionModel);
    const transactionReviewRepository = getRepository(TransactionReviewModel);
    const categoryRepository = getRepository(CategoryModel);
    const eventTagRepository = getRepository(EventTagModel);
    const notifRepository = getRepository(NotifModel)

    await transactionReviewRepository.delete({});
    await transactionRepository.delete({});
    await requestRepository.delete({});
    await reportRepository.delete({});
    await userReviewRepository.delete({});
    await feedbackRepository.delete({});
    await notifRepository.delete({});
    await postRepository.delete({});
    await categoryRepository.delete({});
    await eventTagRepository.delete({});
    await userRepository.delete({});
    console.log(
      " - Deleted all existing users, posts, feedback, reviews, reports, requests, transactions, and transaction reviews",
    );

    // Create categories first
    const categories = [];
    const categoryNames = [
      "HANDMADE",
      "ELECTRONICS",
      "CLOTHING",
      "BOOKS",
      "FURNITURE",
    ];
    for (const categoryName of categoryNames) {
      const category = await factory(CategoryModel)({
        name: categoryName,
      }).create();
      categories.push(category);
    }

    // Create event tags
    const eventTags = [];
    const eventTagNames = ['start_of_semester', 'end_of_semester', 'homecoming', 'halloween', 'holiday_season', 'st_patricks_day', 'slope_day'];
    for (const eventTagName of eventTagNames) {
      const eventTag = await factory(EventTagModel)({ name: eventTagName }).create();
      eventTags.push(eventTag);
    }

    // Create users, posts, feedback, reviews, reports, and requests
    const users = [];
    const posts = [];
    const transactions = [];
    for (let i = 1; i <= 5; i++) {
      const user = await factory(UserModel)({ index: i }).create();
      users.push(user);

      // Create posts for users with an odd index
      if (i % 2 !== 0) {
        for (let j = 1; j <= 2; j++) {
          const selectedCategories = [categories[0]];
          const post = await factory(PostModel)({
            index: j,
            user,
            categories: selectedCategories,
          }).create();
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
      await factory(UserReviewModel)({
        index: i,
        buyer: users[i - 2],
        seller: users[i - 1],
      }).create();
    }

    // Create reports for users with even indexes
    for (let i = 2; i <= users.length; i += 2) {
      await factory(ReportModel)({
        index: i,
        reporter: users[i - 2],
        reported: users[i - 1],
        post:
          i % 3 === 0
            ? null
            : await factory(PostModel)({
                index: 1,
                user: users[i - 2],
              }).create(),
        message: i % 3 !== 0 ? null : undefined,
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

      const transaction = await factory(TransactionModel)({
        index: i + 1,
        buyer,
        seller,
        post,
      }).create();
      transactions.push(transaction);
    }

    // Create transaction reviews for half of the transactions
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      await factory(TransactionReviewModel)({
        index: i + 1,
        transaction,
        stars: 5,
        comments: i % 2 === 0 ? "Great transaction!" : null,
        hadIssues: i % 3 === 0,
        issueCategory: i % 3 === 0 ? "Late delivery" : null,
        issueDetails: i % 3 === 0 ? "The seller was late by 30 minutes." : null,
      }).create();
    }

    // Create notifications for each user
    for (const user of users) {
      for (let j = 1; j <= 3; j++) {
        await factory(NotifModel)({
          user,
          index: j,
        }).create();
      }
    }
  }
}
