import * as faker from 'faker';

import { TransactionReviewModel } from '../../models/TransactionReviewModel';
import { TransactionModel } from '../../models/TransactionModel';
import { FactoryUtils } from './FactoryUtils';

export class TransactionReviewFactory {
  public static create(n: number): TransactionReviewModel[] {
    /**
     * Returns a list of n number of random TransactionReviewModel objects
     * 
     * @param n The number of desired random TransactionReviewModel objects
     * @returns The list of n number of random TransactionReviewModel objects
     */
    return FactoryUtils.create(n, TransactionReviewFactory.fake);
  }

  public static fakeTemplate(): TransactionReviewModel {
    /**
     * Returns a predefined TransactionReviewModel object.
     * Useful for testing specific instance variables since we already know the value of them.
     * 
     * @returns The predefined TransactionReviewModel object.
     */
    const fakeTransactionReview = new TransactionReviewModel();
    fakeTransactionReview.id = '1e900348-df68-42b3-a8c9-270205575314';
    fakeTransactionReview.stars = 5;
    fakeTransactionReview.comments = 'Everything went smoothly!';
    fakeTransactionReview.hadIssues = false;
    fakeTransactionReview.issueCategory = null;
    fakeTransactionReview.issueDetails = null;

    return fakeTransactionReview;
  }

  public static fake(): TransactionReviewModel {
    /**
     * Returns a TransactionReviewModel with random values in its instance variables.
     * 
     * @returns The TransactionReviewModel object with random values in its instance variables.
     */
    const fakeTransactionReview = new TransactionReviewModel();
    fakeTransactionReview.id = faker.datatype.uuid();
    fakeTransactionReview.stars = faker.datatype.number({ min: 1, max: 5 });
    fakeTransactionReview.comments = faker.random.boolean() ? faker.lorem.sentence() : null;
    fakeTransactionReview.hadIssues = faker.datatype.boolean();
    fakeTransactionReview.issueCategory = fakeTransactionReview.hadIssues ? faker.lorem.word() : null;
    fakeTransactionReview.issueDetails = fakeTransactionReview.hadIssues ? faker.lorem.sentence() : null;

    return fakeTransactionReview;
  }
}
