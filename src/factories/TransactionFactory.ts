// TransactionFactory.ts
import { define } from "typeorm-seeding";
import { TransactionModel } from "../models/TransactionModel";
import { UserModel } from "../models/UserModel";
import { PostModel } from "../models/PostModel";

// Define a factory for TransactionModel
define(
  TransactionModel,
  (
    _,
    context?: {
      index?: number;
      buyer?: UserModel;
      seller?: UserModel;
      post?: PostModel;
    },
  ) => {
    if (
      context === undefined ||
      context.buyer === undefined ||
      context.seller === undefined ||
      context.post === undefined ||
      context.index === undefined
    ) {
      throw "Context, buyer, seller, post, and index cannot be undefined";
    }

    const transaction = new TransactionModel();
    const index = context.index; // Use the provided index for uniqueness

    transaction.buyer = context.buyer;
    transaction.seller = context.seller;
    transaction.post = context.post;

    // Use consistent data for transaction fields, utilizing index for uniqueness
    transaction.location = `Sample Location - Buyer ${transaction.buyer.givenName} - Seller ${transaction.seller.givenName} - Index: ${index}`;
    transaction.amount = 100 + index; // Increment amount for uniqueness
    transaction.transactionDate = new Date(
      `2023-01-${String(index).padStart(2, "0")}T12:00:00Z`,
    ); // Unique date for each transaction
    transaction.completed = index % 2 === 0; // Alternate between true and false for completed

    return transaction;
  },
);
