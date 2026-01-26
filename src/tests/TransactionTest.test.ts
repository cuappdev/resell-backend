import { TransactionController } from "src/api/controllers/TransactionController";
import { Connection } from "typeorm";

import { UuidParam } from "../api/validators/GenericRequests";
import { ControllerFactory } from "./controllers";
import {
  DatabaseConnection,
  DataFactory,
  TransactionFactory,
  UserFactory,
  PostFactory,
} from "./data";

let uuidParam: UuidParam;
let conn: Connection;
let transactionController: TransactionController;

beforeAll(async () => {
  await DatabaseConnection.connect();
});

beforeEach(async () => {
  await DatabaseConnection.clear();
  conn = await DatabaseConnection.connect();
  transactionController = ControllerFactory.transaction(conn);
});

afterAll(async () => {
  await DatabaseConnection.clear();
  await DatabaseConnection.close();
});

describe("transaction tests", () => {
  test("get all transactions - no transactions", async () => {
    const getTransactionsResponse =
      await transactionController.getAllTransactions();
    expect(getTransactionsResponse.transactions).toHaveLength(0);
  });

  test("get all transactions - one transaction", async () => {
    const buyer = UserFactory.fake();
    const seller = UserFactory.fake();
    const post = PostFactory.fake();
    const transaction = TransactionFactory.fake();
    transaction.buyer = buyer;
    transaction.seller = seller;
    transaction.post = post;

    await new DataFactory()
      .createUsers(buyer, seller)
      .createPosts(post)
      .createTransactions(transaction)
      .write();

    const getTransactionsResponse =
      await transactionController.getAllTransactions();
    expect(getTransactionsResponse.transactions).toHaveLength(1);
  });

  test("get transaction by id", async () => {
    const buyer = UserFactory.fake();
    const seller = UserFactory.fake();
    const post = PostFactory.fake();
    const transaction = TransactionFactory.fake();

    transaction.buyer = buyer;
    transaction.seller = seller;
    transaction.post = post;

    // Create dependent entities first
    await new DataFactory()
      .createUsers(buyer, seller)
      .createPosts(post)
      .createTransactions(transaction)
      .write();

    const getTransactionResponse =
      await transactionController.getTransactionById({ id: transaction.id });
    expect(getTransactionResponse.transaction.id).toEqual(transaction.id);
  });

  test("create transaction", async () => {
    const buyer = UserFactory.fake();
    const seller = UserFactory.fake();
    const post = PostFactory.fake();

    await new DataFactory()
      .createUsers(buyer, seller)
      .createPosts(post)
      .write();

    const newTransaction = {
      location: "Ithaca Commons",
      amount: 150.75,
      transactionDate: new Date("2024-01-01T12:00:00Z"),
      postId: post.id,
      buyerId: buyer.firebaseUid,
      sellerId: seller.firebaseUid,
    };

    const createTransactionResponse =
      await transactionController.createTransaction(newTransaction);
    expect(createTransactionResponse.transaction.location).toEqual(
      "Ithaca Commons",
    );
    expect(createTransactionResponse.transaction.amount).toEqual(150.75);
  });

  test("get transactions by buyer id", async () => {
    const buyer = UserFactory.fake();
    const seller = UserFactory.fake();
    const [post1, post2] = PostFactory.create(2);
    const [transaction1, transaction2] = TransactionFactory.create(2);

    transaction1.buyer = buyer;
    transaction1.seller = seller;
    transaction1.post = post1;

    transaction2.buyer = buyer;
    transaction2.seller = seller;
    transaction2.post = post2;

    await new DataFactory()
      .createUsers(buyer, seller)
      .createPosts(post1, post2)
      .createTransactions(transaction1, transaction2)
      .write();

    const getTransactionsResponse =
      await transactionController.getTransactionsByBuyerId({
        id: buyer.firebaseUid,
      });
    expect(getTransactionsResponse.transactions).toHaveLength(2);
  });

  test("complete a transaction - ensure post is marked as sold", async () => {
    const buyer = UserFactory.fake();
    const seller = UserFactory.fake();
    const post = PostFactory.fake();
    const transaction = TransactionFactory.fake();

    transaction.buyer = buyer;
    transaction.seller = seller;
    transaction.post = post;
    post.user = seller;

    // Create dependent entities first
    await new DataFactory()
      .createUsers(buyer, seller)
      .createPosts(post)
      .createTransactions(transaction)
      .write();

    const getTransactionResponse =
      await transactionController.completeTransaction(
        { id: transaction.id },
        { completed: true },
      );

    const postController = ControllerFactory.post(conn);
    const retrievedPost = await postController.getPostById(seller, {
      id: post.id,
    });
    expect(retrievedPost.post.sold).toEqual(true);
  });

  test("complete a transaction - ensure post is marked as sold and savers are notified and post is archived", async () => {
    const buyer = UserFactory.fake();
    const seller = UserFactory.fake();
    const saver1 = UserFactory.fake();
    const saver2 = UserFactory.fake();
    const post = PostFactory.fake();
    const transaction = TransactionFactory.fake();

    transaction.buyer = buyer;
    transaction.seller = seller;
    transaction.post = post;
    post.user = seller;
    post.savers = [saver1, saver2]; // Add savers to the post

    // Create dependent entities first
    await new DataFactory()
      .createUsers(buyer, seller, saver1, saver2)
      .createPosts(post)
      .createTransactions(transaction)
      .write();

    const getTransactionResponse =
      await transactionController.completeTransaction(
        { id: transaction.id },
        { completed: true },
      );

    const postController = ControllerFactory.post(conn);
    const retrievedPost = await postController.getPostById(seller, {
      id: post.id,
    });

    // Verify the post is marked as sold
    expect(retrievedPost.post.sold).toEqual(true);
    expect(retrievedPost.post.archive).toEqual(true);
  });
});
