import * as faker from "faker";

import { TransactionModel } from "../../models/TransactionModel";
import { UserModel } from "../../models/UserModel";
import { PostModel } from "../../models/PostModel";
import { FactoryUtils } from "./FactoryUtils";

export class TransactionFactory {
  public static create(n: number): TransactionModel[] {
    /**
     * Returns a list of n number of random TransactionModel objects
     *
     * @param n The number of desired random TransactionModel objects
     * @returns The list of n number of random TransactionModel objects
     */
    return FactoryUtils.create(n, TransactionFactory.fake);
  }

  public static fakeTemplate(): TransactionModel {
    /**
     * Returns a predefined TransactionModel object. Useful for testing
     * specific instance variables since we already know the value of them
     *
     * @returns The predefined TransactionModel object
     */
    const fakeTransaction = new TransactionModel();
    fakeTransaction.id = "123e4567-e89b-12d3-a456-426614174000";
    fakeTransaction.location = "Ithaca Commons";
    fakeTransaction.amount = 150.75;
    fakeTransaction.transactionDate = new Date("2024-01-01T12:00:00Z");
    fakeTransaction.completed = true;

    const fakeBuyer = new UserModel();
    fakeBuyer.firebaseUid = "81e6896c-a549-41bf-8851-604e7fbd4f1f";
    fakeBuyer.givenName = "John";
    fakeBuyer.familyName = "Doe";
    fakeTransaction.buyer = fakeBuyer;

    const fakeSeller = new UserModel();
    fakeSeller.firebaseUid = "91e6896c-a549-41bf-8851-604e7fbd4f2f";
    fakeSeller.givenName = "Jane";
    fakeSeller.familyName = "Smith";
    fakeTransaction.seller = fakeSeller;

    const fakePost = new PostModel();
    fakePost.id = "71e6896c-a549-41bf-8851-604e7fbd4f3f";
    fakePost.title = "Used Textbook";
    fakePost.description = "A lightly used textbook for sale.";
    fakeTransaction.post = fakePost;

    return fakeTransaction;
  }

  public static fake(): TransactionModel {
    /**
     * Returns a TransactionModel with random values in its instance variables
     *
     * @returns The TransactionModel object with random values in its instance variables
     */
    const fakeTransaction = new TransactionModel();
    fakeTransaction.id = faker.datatype.uuid();
    fakeTransaction.location = faker.address.streetAddress();
    fakeTransaction.amount = Number(faker.commerce.price(10, 500));
    fakeTransaction.transactionDate = faker.date.recent(30);
    fakeTransaction.completed = faker.datatype.boolean();
    // fakePost.title = faker.commerce.productName();
    // fakePost.description = faker.commerce.productDescription();
    // fakeTransaction.post = fakePost;

    return fakeTransaction;
  }
}
