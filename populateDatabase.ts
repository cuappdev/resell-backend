/**
 * Database Population Script for Resell Backend
 * 
 * This script populates the database with mock data for all entities in the Resell backend.
 * It is compatible with TypeORM version 0.2.45.
 * 
 * Prerequisites:
 * 1. Node.js and npm installed
 * 2. TypeScript installed globally or in your project
 * 
 * Setup:
 * 1. Ensure your database is set up and running
 * 2. Make sure your ormconfig.ts file is correctly configured with your database details
 * 3. Install required dependencies:
 *    npm install @faker-js/faker
 * 
 * Usage:
 * 1. Place this script in your project root or src directory
 * 2. Run the script using ts-node:
 *    npx ts-node populateDatabase.ts
 * 
 * Customization:
 * - Adjust the number of records created for each entity by changing the arguments
 *   in the respective populate function calls (e.g., populateUsers(50))
 * - Modify the data generation logic in each populate function to suit your needs
 * 
 * Notes:
 * - This script assumes your database tables are already created. If not, ensure
 *   `synchronize: true` is set in your TypeORM configuration or run your migrations first.
 * - Be cautious about running this script on a production database, as it will insert
 *   a large amount of mock data.
 */

import "reflect-metadata";
const typeorm = require("typeorm");
const { createConnection, getRepository } = typeorm;
import { faker } from "@faker-js/faker";

// Import your entity models
import { FeedbackModel } from "./src/models/FeedbackModel";
import { MessageModel } from "./src/models/MessageModel";
import { PostModel } from "./src/models/PostModel";
import { ReportModel } from "./src/models/ReportModel";
import { RequestModel } from "./src/models/RequestModel";
import { UserModel } from "./src/models/UserModel";
import { UserReviewModel } from "./src/models/UserReviewModel";
import { UserSessionModel } from "./src/models/UserSessionModel";

// Import your ormconfig
import * as ormconfig from "./ormconfig";

async function populateDatabase() {
  let connection: any;
  try {
    // Create TypeORM connection
    connection = await createConnection(ormconfig);
    console.log("Database connection established");

    // Populate Users
    const users = await populateUsers(50);
    console.log("Users populated successfully!");
    
    // Populate Posts
    const posts = await populatePosts(100, users);
    console.log("Posts populated successfully!");
    
    // Populate Requests
    await populateRequests(50, users, posts);
    console.log("Requests populated successfully!");
    
    // Populate Feedback
    await populateFeedback(30, users);
    console.log("Feedback populated successfully!");
    
    // Populate UserReviews
    await populateUserReviews(100, users);
    console.log("User Reviews populated successfully!");
    
    // Populate Reports
    await populateReports(20, users, posts);
    console.log("Reports populated successfully!");
    
    // Populate UserSessions
    await populateUserSessions(users);
    console.log("User Sessions populated successfully!");

    console.log("Database populated successfully!");
  } catch (error) {
    console.error("Error during database population:", error);
  } finally {
    if (connection && connection.isConnected) {
      await connection.close();
      console.log("Database connection closed.");
    }
  }
}

async function populateUsers(count: number): Promise<any[]> {
  const userRepository = getRepository(UserModel);
  const users: UserModel[] = [];

  for (let i = 0; i < count; i++) {
    const user = new UserModel();
    user.username = faker.internet.userName();
    user.netid = faker.string.alphanumeric(8);
    user.givenName = faker.person.firstName();
    user.familyName = faker.person.lastName();
    user.admin = faker.datatype.boolean({ probability: 0.1 });
    user.isActive = faker.datatype.boolean({ probability: 0.9 });
    user.stars = parseFloat(faker.number.float({ min: 0, max: 5, fractionDigits: 1}).toFixed(1));
    user.numReviews = faker.number.int({ min: 0, max: 100 });
    user.photoUrl = faker.image.avatar();
    user.venmoHandle = faker.internet.userName();
    user.email = faker.internet.email();
    user.googleId = faker.string.uuid();
    user.bio = faker.lorem.paragraph();

    users.push(await userRepository.save(user));
  }

  return users;
}

async function populatePosts(count: number, users: UserModel[]): Promise<PostModel[]> {
  const postRepository = getRepository(PostModel);
  const posts: PostModel[] = [];

  for (let i = 0; i < count; i++) {
    const post = new PostModel();
    post.title = faker.commerce.productName();
    post.description = faker.commerce.productDescription();
    post.categories = faker.helpers.arrayElements(['Electronics', 'Books', 'Furniture', 'Clothing'], { min: 1, max: 3 });
    post.original_price = parseFloat(faker.commerce.price());
    post.altered_price = faker.datatype.boolean() ? parseFloat(faker.commerce.price()) : -1;
    post.images = faker.helpers.arrayElements([faker.image.url(), faker.image.url(), faker.image.url()], { min: 1, max: 3 });
    post.created = faker.date.past();
    post.location = faker.location.city();
    post.archive = faker.datatype.boolean({ probability: 0.2 });
    post.user = faker.helpers.arrayElement(users);
    post.savers = faker.helpers.arrayElements(users, { min: 0, max: 5 });

    posts.push(await postRepository.save(post));
  }

  return posts;
}

async function populateRequests(count: number, users: UserModel[], posts: PostModel[]): Promise<void> {
  const requestRepository = getRepository(RequestModel);

  for (let i = 0; i < count; i++) {
    const request = new RequestModel();
    request.title = faker.lorem.sentence();
    request.description = faker.lorem.paragraph();
    request.archive = faker.datatype.boolean({ probability: 0.2 });
    request.user = faker.helpers.arrayElement(users);
    request.matches = faker.helpers.arrayElements(posts, { min: 0, max: 5 });

    await requestRepository.save(request);
  }
}

async function populateFeedback(count: number, users: UserModel[]): Promise<void> {
  const feedbackRepository = getRepository(FeedbackModel);

  for (let i = 0; i < count; i++) {
    const feedback = new FeedbackModel();
    feedback.description = faker.lorem.paragraph();
    feedback.images = faker.helpers.arrayElements([faker.image.url(), faker.image.url(), faker.image.url()], { min: 0, max: 3 });
    feedback.user = faker.helpers.arrayElement(users);

    await feedbackRepository.save(feedback);
  }
}

async function populateUserReviews(count: number, users: UserModel[]): Promise<void> {
  const userReviewRepository = getRepository(UserReviewModel);

  for (let i = 0; i < count; i++) {
    const review = new UserReviewModel();
    review.fulfilled = faker.datatype.boolean({ probability: 0.9 });
    review.stars = faker.number.int({ min: 1, max: 5 });
    review.comments = faker.lorem.sentence();
    review.date = faker.date.past();
    review.buyer = faker.helpers.arrayElement(users);
    review.seller = faker.helpers.arrayElement(users.filter(u => u.id !== review.buyer.id));

    await userReviewRepository.save(review);
  }
}

async function populateReports(count: number, users: UserModel[], posts: PostModel[]): Promise<void> {
  const reportRepository = getRepository(ReportModel);
  const messageRepository = getRepository(MessageModel);

  for (let i = 0; i < count; i++) {
    const report = new ReportModel();
    report.reporter = faker.helpers.arrayElement(users);
    report.reported = faker.helpers.arrayElement(users.filter(u => u.id !== report.reporter.id));
    report.reason = faker.lorem.sentence();
    report.type = faker.helpers.arrayElement(['post', 'profile', 'message'] as const);
    report.resolved = faker.datatype.boolean();
    report.created = faker.date.past();

    if (report.type === 'post') {
      report.post = faker.helpers.arrayElement(posts);
    } else if (report.type === 'message') {
      const message = new MessageModel();
      message.id = faker.string.uuid();
      await messageRepository.save(message);
      report.message = message;
    }

    await reportRepository.save(report);
  }
}

async function populateUserSessions(users: UserModel[]): Promise<void> {
  const userSessionRepository = getRepository(UserSessionModel);

  for (const user of users) {
    const session = new UserSessionModel();
    session.update();  // This will set accessToken, refreshToken, and expiresAt
    session.deviceToken = faker.string.alphanumeric(32);
    session.user = user;
    session.userId = user.id;

    await userSessionRepository.save(session);
  }
}

populateDatabase().catch(error => console.error("Unhandled error during database population:", error));