import { PostModel } from 'src/models/PostModel';
import { AbstractRepository, EntityRepository } from 'typeorm';

import { ConflictError } from '../errors';
import { UserModel } from '../models/UserModel';
import { Uuid } from '../types';

@EntityRepository(UserModel)
export class UserRepository extends AbstractRepository<UserModel> {
  public async getAllUsers(): Promise<UserModel[]> {
    return await this.repository.find();
  }

  public async getUserById(id: Uuid): Promise<UserModel | undefined> {
    return await this.repository
      .createQueryBuilder("user")
      .where("user.id = :id", { id })
      .getOne();
  }

  public async getUserByGoogleId(googleId: Uuid): Promise<UserModel | undefined> {
    return await this.repository
      .createQueryBuilder("user")
      .where("user.googleId = :googleId", { googleId })
      .getOne();
  }

  public async savePost(user: UserModel, post: PostModel): Promise<PostModel> {
    user.saved.push(post);
    await this.repository.save(user);
    return post;
  }

  public async unsavePost(user: UserModel, post: PostModel): Promise<PostModel> {
    user.saved.splice(user.saved.indexOf(post));
    await this.repository.save(user);
    return post;
  }

  public async isSavedPost(user: UserModel, post: PostModel): Promise<boolean> {
    for (const savedPost of user.saved) {
      if (savedPost.id === post.id) {
        return true;
      }
    }
    return false;
  }

  public async getSavedPostsByUserId(id: Uuid): Promise<UserModel | undefined> {
    return await this.repository
      .createQueryBuilder("user")
      .where("user.id = :id", { id })
      .leftJoinAndSelect("user.saved", "post")
      .getOne();
  }

  public async getUserByEmail(email: string): Promise<UserModel | undefined> {
    return await this.repository
      .createQueryBuilder("user")
      .where("user.email = :email", { email })
      .getOne();
  }

  public async createUser(
    username: string,
    netid: string,
    givenName: string,
    familyName: string,
    photoUrl: string,
    email: string,
    googleId: string,
  ): Promise<UserModel> {
    let existingUser = this.repository
      .createQueryBuilder("user")
      .where("user.email = :email", { email })
      .getOne();
    if (await existingUser) throw new ConflictError('UserModel with same email already exists!');

    existingUser = this.repository
      .createQueryBuilder("user")
      .where("user.googleId = :googleId", { googleId })
      .getOne();
    if (await existingUser) throw new ConflictError('UserModel with same google ID already exists!');

    const adminEmails = process.env.ADMIN_EMAILS?.split(",");
    const adminStatus = adminEmails?.includes(email);

    const user = new UserModel();
    user.username = username;
    user.netid = netid;
    user.givenName = givenName;
    user.familyName = familyName;
    user.admin = adminStatus || false;
    user.photoUrl = photoUrl;
    user.email = email;
    user.googleId = googleId;
    return this.repository.save(user);
  }

  public async updateUser(
    user: UserModel,
    username: string | undefined,
    photoUrl: string | undefined,
    venmoHandle: string | undefined,
    bio: string | undefined,
  ): Promise<UserModel> {
    const existingUser = this.repository
      .createQueryBuilder("user")
      .where("user.username = :username", { username })
      .getOne();
    if (await existingUser) {
      if (username !== user.username) {
        throw new ConflictError('UserModel with same username already exists!');
      }
    }

    user.username = username ?? user.username;
    user.photoUrl = photoUrl ?? user.photoUrl;
    user.venmoHandle = venmoHandle ?? user.venmoHandle;
    user.bio = bio ?? user.bio;
    return await this.repository.save(user);
  }

  public async addDeviceToken(
    user: UserModel,
    deviceTokens: string[] | undefined
  ): Promise<UserModel> {
    if (deviceTokens) {
      user.deviceTokens = user.deviceTokens.concat(deviceTokens)
    }
    return await this.repository.save(user);
  }

  public async removeDeviceToken(
    user: UserModel,
    deviceToken: string 
  ): Promise<UserModel> {
    user.deviceTokens = user.deviceTokens.filter((e, i) => e !== deviceToken)
    return await this.repository.save(user)
  }

  public async setAdmin(user: UserModel, status: boolean): Promise<UserModel> {
    user.admin = status;
    return await this.repository.save(user);
  }

  public async deleteUser(user: UserModel): Promise<UserModel> {
    return await this.repository.remove(user);
  }

  public async saveToken(user: UserModel, token: string): Promise<UserModel> {
    if (!user.deviceTokens) {
      user.deviceTokens = []
    }
    else {
      user.deviceTokens.push(token);
    }
    return await this.repository.save(user)
  }
}