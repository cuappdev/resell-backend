import { TransactionReviewController } from "src/api/controllers/TransactionReviewController";
import { Connection } from "typeorm";

import { UuidParam } from "../api/validators/GenericRequests";
import { ControllerFactory } from "./controllers";
import {
  DatabaseConnection,
  DataFactory,
  TransactionFactory,
  TransactionReviewFactory,
} from "./data";
import { CreateTransactionReviewRequest } from "src/types";

let uuidParam: UuidParam;
let conn: Connection;
let transactionReviewController: TransactionReviewController;

beforeAll(async () => {
  await DatabaseConnection.connect();
});

beforeEach(async () => {
  await DatabaseConnection.clear();
  conn = await DatabaseConnection.connect();
  transactionReviewController = ControllerFactory.transactionReview(conn);
});

afterAll(async () => {
  await DatabaseConnection.clear();
  await DatabaseConnection.close();
});

describe('transaction review tests', () => {
  test('get all transaction reviews - no reviews', async () => {
    const response = await transactionReviewController.getTransactionReviews();
    expect(response.reviews).toHaveLength(0);
  });

  test("get all transaction reviews - one review", async () => {
    const transaction = TransactionFactory.fake();
    const transactionReview = TransactionReviewFactory.fake();
    transactionReview.transaction = transaction;

    await new DataFactory()
      .createTransactions(transaction)
      .createTransactionReviews(transactionReview)
      .write();

    const response = await transactionReviewController.getTransactionReviews();
    expect(response.reviews).toHaveLength(1);
  });

  test("get transaction review by id", async () => {
    const transaction = TransactionFactory.fake();
    const transactionReview = TransactionReviewFactory.fake();
    transactionReview.transaction = transaction;

    await new DataFactory()
      .createTransactions(transaction)
      .createTransactionReviews(transactionReview)
      .write();

    const response = await transactionReviewController.getTransactionReviewById({ id: transactionReview.id });
    expect(response.review.id).toEqual(transactionReview.id);
    expect(response.review.stars).toEqual(transactionReview.stars);
  });

  test("create transaction review", async () => {
    const transaction = TransactionFactory.fake();

    await new DataFactory().createTransactions(transaction).write();

    const newTransactionReview: CreateTransactionReviewRequest = {
      transactionId: transaction.id,
      stars: 4,
      comments: "Great transaction!",
    };

    const response = await transactionReviewController.createTransactionReview(newTransactionReview);
    expect(response.review.stars).toEqual(newTransactionReview.stars);
    expect(response.review.comments).toEqual(newTransactionReview.comments);
  });

  test("get transaction review by transaction id", async () => {
    const transaction = TransactionFactory.fake();
    const transactionReview = TransactionReviewFactory.fake();
    transactionReview.transaction = transaction;

    await new DataFactory()
      .createTransactions(transaction)
      .createTransactionReviews(transactionReview)
      .write();

    const response = await transactionReviewController.getTransactionReviewByTransactionId({ id: transaction.id });
    expect(response.review.transaction.id).toEqual(transaction.id);
    expect(response.review.stars).toEqual(transactionReview.stars);
  });

  test("get all transaction reviews for multiple transactions", async () => {
    const [transaction1, transaction2] = TransactionFactory.create(2);
    const [review1, review2] = TransactionReviewFactory.create(2);

    review1.transaction = transaction1;
    review2.transaction = transaction2;

    await new DataFactory()
      .createTransactions(transaction1, transaction2)
      .createTransactionReviews(review1, review2)
      .write();

    const response = await transactionReviewController.getTransactionReviews();
    expect(response.reviews).toHaveLength(2);
  });
});
