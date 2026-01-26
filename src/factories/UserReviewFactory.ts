// UserReviewFactory.ts
import { define } from "typeorm-seeding";
import { UserReviewModel } from "../models/UserReviewModel";
import { UserModel } from "../models/UserModel";

// Define a factory for UserReviewModel
define(
  UserReviewModel,
  (_, context?: { index?: number; buyer?: UserModel; seller?: UserModel }) => {
    if (
      context === undefined ||
      context.buyer === undefined ||
      context.seller === undefined ||
      context.index === undefined
    )
      throw "Context, buyer, and seller cannot be undefined";

    const review = new UserReviewModel();
    const index = context.index;

    review.buyer = context.buyer;
    review.seller = context.seller;

    // Use consistent data for review fields, utilizing index for uniqueness
    review.fulfilled = index % 2 === 0; // Alternate between true and false for fulfilled
    review.stars = (index % 5) + 1; // Stars from 1 to 5
    review.comments = `This is a review comment ${index} for buyer ${review.buyer.givenName} and seller ${review.seller.givenName}`;
    review.date = new Date("2023-01-01T00:00:00Z");

    return review;
  },
);
