import {
  AbstractRepository,
  EntityRepository,
  getRepository,
  Repository,
  SelectQueryBuilder,
} from "typeorm";

import UserModel from "../models/UserModel";

@EntityRepository(UserModel)
export class UserRepository extends AbstractRepository<UserModel> {
  public async getAllUsers(): Promise<UserModel[]> {
    return this.repository.find();
  }

  public async getUserById(id: string): Promise<UserModel | undefined> {
    return this.repository
      .createQueryBuilder("user")
      .where("user.id = :id", { id })
      .getOne();
  }

  public async getUserByEmail(email: string): Promise<UserModel | undefined> {
    return this.repository
      .createQueryBuilder("user")
      .where("user.email = :email", { email })
      .getOne();
  }

  public async getUserByGoogleId(googleId: string): Promise<UserModel | undefined> {
    return this.repository
      .createQueryBuilder("user")
      .where("user.googleId = :googleId", { googleId })
      .getOne();
  }

  public async postUser(
    email: string,
    googleId: string,
    name: string,
    profilePictureUrl: string,
    bio?: string
  ): Promise<UserModel> {
    let existingUser = this.repository
      .createQueryBuilder("user")
      .where("user.email = :email", { email })
      .getOne();
    if (await existingUser) throw Error('UserModel with same email already exists!');

    existingUser = this.repository
      .createQueryBuilder("user")
      .where("user.googleId = :googleId", { googleId })
      .getOne();
    if (await existingUser) throw Error('UserModel with same google ID already exists!');

    const user = new UserModel();
    user.bio = bio || user.bio;
    user.email = email;
    user.googleId = googleId;
    user.name = name;
    user.profilePictureUrl = profilePictureUrl;
    this.repository.save(user);
    return user;
  }

  public async postDummyUser(tag: string): Promise<UserModel> {
    const user = new UserModel();
    user.bio = `bio-${tag}`;
    user.email = `email-${tag}`;
    user.googleId = `googleId-${tag}`;
    user.name = `name-${tag}`;
    user.profilePictureUrl = `pfp-${tag}`;
    this.repository.save(user);
    return user;
  }

  public async deleteUserById(id: string): Promise<boolean> {
    this.repository
      .createQueryBuilder("user")
      .where("user.id = :id", { id })
      .getOne()
      .then(user => {
        if (user) {
          this.repository.remove(user);
          return true;
        } else {
          return false;
        }
      })
    return false;
  }
}