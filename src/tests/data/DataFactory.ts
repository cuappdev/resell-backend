import { PostModel } from '../../models/PostModel';
import { RequestModel } from '../../models/RequestModel';
import { UserModel } from '../../models/UserModel';
import { UserReviewModel } from '../../models/UserReviewModel';
import { UserSessionModel } from '../../models/UserSessionModel';
import { DatabaseConnection } from './DatabaseConnection';
import { TransactionModel } from '../../models/TransactionModel';
import { TransactionReviewModel } from '../../models/TransactionReviewModel';



export class DataFactory {
    private users: UserModel[] = [];
    private posts: PostModel[] = [];
    private userSessions: UserSessionModel[] = [];
    private requests: RequestModel[] = [];
    private userReviews: UserReviewModel[] = [];
    private transactions: TransactionModel[] = [];
    private transactionReviews: TransactionReviewModel[] = [];



    public async write(): Promise<void> {
        const conn = await DatabaseConnection.connect();
        await conn.transaction(async (txn) => {
            this.users = await txn.save(this.users);
            this.posts = await txn.save(this.posts);
            this.userSessions = await txn.save(this.userSessions);
            this.requests = await txn.save(this.requests);
            this.userReviews = await txn.save(this.userReviews);
            this.transactions = await txn.save(this.transactions);
            this.transactionReviews = await txn.save(this.transactionReviews);
        });
    }

    public createUsers(...users: UserModel[]): DataFactory {
        for (let i = 0; i < users.length; i += 1) {
            this.users.push(users[i]);
        }
        return this;
    }

    public createPosts(...posts: PostModel[]): DataFactory {
        for (let i = 0; i < posts.length; i += 1) {
            this.posts.push(posts[i]);
        }
        return this;
    }

    public createUserSessions(...userSessions: UserSessionModel[]): DataFactory {
        for (let i = 0; i < userSessions.length; i += 1) {
            this.userSessions.push(userSessions[i]);
        }
        return this;
    }

    public createRequests(...requests: RequestModel[]): DataFactory {
        for (let i = 0; i < requests.length; i += 1) {
            this.requests.push(requests[i]);
        }
        return this;
    }

    public createUserReviews(...userReviews: UserReviewModel[]) {
        for (let i = 0; i < userReviews.length; i += 1) {
            this.userReviews.push(userReviews[i]);
        }
        return this;
    }

    public createTransactions(...transactions: TransactionModel[]) {
        for (let i = 0; i < transactions.length; i += 1) {
            this.transactions.push(transactions[i]);
        }
        return this;
    }

    public createTransactionReviews (...transactionReviews: TransactionReviewModel[]) {
        for (let i = 0; i < transactionReviews.length; i += 1) {
            this.transactionReviews.push(transactionReviews[i]);
        }
        return this;
    }
}