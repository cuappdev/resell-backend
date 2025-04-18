import { PostModel } from '../../models/PostModel';
import { RequestModel } from '../../models/RequestModel';
import { UserModel } from '../../models/UserModel';
import { UserReviewModel } from '../../models/UserReviewModel';
import { DatabaseConnection } from './DatabaseConnection';
import { TransactionModel } from '../../models/TransactionModel';
import { TransactionReviewModel } from '../../models/TransactionReviewModel';
import { NotifModel } from '../../models/NotifModel';
import { FcmTokenModel } from 'src/models/FcmTokenModel';
import { CategoryModel } from '../../models/CategoryModel'; // Added import statement for CategoryModel



export class DataFactory {
    private users: UserModel[] = [];
    private posts: PostModel[] = [];
    private requests: RequestModel[] = [];
    private userReviews: UserReviewModel[] = [];
    private transactions: TransactionModel[] = [];
    private transactionReviews: TransactionReviewModel[] = [];
    private notifications: NotifModel[] = [];
    private fcmTokens: FcmTokenModel[] = [];
    private categories: CategoryModel[] = []; // Added categories array



    public async write(): Promise<void> {
        const conn = await DatabaseConnection.connect();
        await conn.transaction(async (txn) => {
            this.users = await txn.save(this.users);
            
            // Extract all categories from posts and save them first
            const allCategories = new Set<CategoryModel>();
            for (const post of this.posts) {
                if (post.categories && post.categories.length > 0) {
                    post.categories.forEach(category => allCategories.add(category));
                }
            }
            this.categories.push(...Array.from(allCategories));
            this.categories = await txn.save(this.categories);
            
            this.posts = await txn.save(this.posts);
            this.requests = await txn.save(this.requests);
            this.userReviews = await txn.save(this.userReviews);
            this.transactions = await txn.save(this.transactions);
            this.transactionReviews = await txn.save(this.transactionReviews);
            this.notifications = await txn.save(this.notifications);
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

    public createNotifications(...notifications: NotifModel[]): DataFactory {
        for (let i = 0; i < notifications.length; i += 1) {
            this.notifications.push(notifications[i]);
        }
        return this;
    }
    
    public createFcmTokens(...fcmTokens: FcmTokenModel[]): DataFactory {
        for (let i = 0; i < fcmTokens.length; i += 1) {
            this.fcmTokens.push(fcmTokens[i]);
        }
        return this;
    }

    public createCategories(...categories: CategoryModel[]): DataFactory {
        for (let i = 0; i < categories.length; i += 1) {
            this.categories.push(categories[i]);
        }
        return this;
    }
}