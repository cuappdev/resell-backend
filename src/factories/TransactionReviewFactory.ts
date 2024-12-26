// TransactionReviewFactory.ts
import { define } from 'typeorm-seeding';
import { TransactionReviewModel } from '../models/TransactionReviewModel';
import { TransactionModel } from '../models/TransactionModel';

// Define a factory for TransactionReviewModel
define(TransactionReviewModel, (_, context?: { index?: number; transaction?: TransactionModel }) => {
  if (context === undefined || context.transaction === undefined || context.index === undefined) {
    throw "Context, transaction, and index cannot be undefined";
  }

  const transactionReview = new TransactionReviewModel();
  const index = context.index; // Use the provided index for uniqueness

  transactionReview.transaction = context.transaction;

  // Use consistent data for transaction review fields, utilizing index for uniqueness
  transactionReview.stars = (index % 5) + 1; // Stars from 1 to 5
  transactionReview.comments = index % 2 === 0 ? `Great transaction! - Index: ${index}` : null; // Alternate between having comments or not
  transactionReview.hadIssues = index % 3 === 0; // Alternate having issues
  transactionReview.issueCategory = transactionReview.hadIssues ? `Issue Category - Index: ${index}` : null; // Issue category if hadIssues is true
  transactionReview.issueDetails = transactionReview.hadIssues ? `Detailed issue description for transaction review - Index: ${index}` : null; // Issue details if hadIssues is true
  transactionReview.createdAt = new Date(`2023-01-${String(index).padStart(2, '0')}T12:00:00Z`); // Unique creation date

  return transactionReview;
});
