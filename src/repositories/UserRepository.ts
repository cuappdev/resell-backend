import { PostModel } from "src/models/PostModel";
import { AbstractRepository, EntityRepository } from "typeorm";

import { NotFoundError } from "routing-controllers";
import { ConflictError } from "../errors";
import { UserModel } from "../models/UserModel";
import { Uuid } from "../types";

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

  public async getUserWithBlockedInfo(
    id: Uuid
  ): Promise<UserModel | undefined> {
    return this.repository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.blocking", "user_blocking_users.blocking")
      .leftJoinAndSelect("user.blockers", "user_blocking_users.blockers")
      .where("user.id = :id", { id })
      .getOne();
  }

  public async getUserByGoogleId(
    googleId: Uuid
  ): Promise<UserModel | undefined> {
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

  public async unsavePost(
    user: UserModel,
    post: PostModel
  ): Promise<PostModel> {
    const postIndex = user.saved.findIndex(
      (savedPost) => savedPost.id === post.id
    );
    if (postIndex === -1) {
      throw new NotFoundError(
        "Tried to unsave post that was not found in user's saved posts."
      );
    }
    user.saved.splice(postIndex, 1);
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
    googleId: string
  ): Promise<UserModel> {
    let existingUser = await this.repository
      .createQueryBuilder("user")
      .where("user.username = :username", { username })
      .orWhere("user.netid = :netid", { netid })
      .orWhere("user.email = :email", { email })
      .orWhere("user.googleId = :googleId", { googleId })
      .getOne();
    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictError("UserModel with same username already exists!");
      } else if (existingUser.netid === netid) {
        throw new ConflictError("UserModel with same netid already exists!");
      } else if (existingUser.email === email) {
        throw new ConflictError("UserModel with same email already exists!");
      } else {
        throw new ConflictError(
          "UserModel with same google ID already exists!"
        );
      }
    }
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
    bio: string | undefined
  ): Promise<UserModel> {
    const existingUser = this.repository
      .createQueryBuilder("user")
      .where("user.username = :username", { username })
      .getOne();
    if (await existingUser) {
      if (username !== user.username) {
        throw new ConflictError("UserModel with same username already exists!");
      }
    }

    user.username = username ?? user.username;
    user.photoUrl = photoUrl ?? user.photoUrl;
    user.venmoHandle = venmoHandle ?? user.venmoHandle;
    user.bio = bio ?? user.bio;
    return await this.repository.save(user);
  }

  public async setAdmin(user: UserModel, status: boolean): Promise<UserModel> {
    user.admin = status;
    return await this.repository.save(user);
  }

  public async deleteUser(user: UserModel): Promise<UserModel> {
    return await this.repository.remove(user);
  }

  public async blockUser(
    blocker: UserModel,
    blocked: UserModel
  ): Promise<UserModel> {
    if (blocker.blocking === undefined) {
      blocker.blocking = [blocked];
    } else {
      blocker.blocking.push(blocked);
    }
    return this.repository.save(blocker);
  }

  public async unblockUser(
    blocker: UserModel,
    blocked: UserModel
  ): Promise<UserModel> {
    if (blocker.blocking === undefined) {
      throw new NotFoundError("User has not been blocked!");
    } else {
      if (!blocker.blocking.find((user) => user.id === blocked.id)) {
        throw new NotFoundError("User has not been blocked!");
      }
      // remove blocked user from blocking list
      blocker.blocking = blocker.blocking.filter(
        (user) => user.id !== blocked.id
      );
    }
    return this.repository.save(blocker);
  }

  public async softDeleteUser(user: UserModel): Promise<UserModel> {
    user.isActive = false;
    return this.repository.save(user);
  }
}
