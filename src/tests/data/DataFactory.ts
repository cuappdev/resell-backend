import { PostModel } from '../../models/PostModel';
import { UserModel } from '../../models/UserModel';
import { UserSessionModel } from '../../models/UserSessionModel';
import { DatabaseConnection } from './DatabaseConnection';

export class DataFactory {
    private users: UserModel[] = [];
    private posts: PostModel[] = [];
    private userSessions: UserSessionModel[] = [];

    public async write(): Promise<void> {
        const conn = await DatabaseConnection.connect();
        await conn.transaction(async (txn) => {
            this.users = await txn.save(this.users);
            this.posts = await txn.save(this.posts);
            this.userSessions = await txn.save(this.userSessions);
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
}