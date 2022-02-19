import {
  AbstractRepository,
  EntityRepository,
  getRepository,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import {
  Uuid,
} from '../types'

import { UserModel } from "../models/UserModel";

@EntityRepository(UserModel)
export class UserRepository extends AbstractRepository<UserModel> {
  public async getAllUsers(): Promise<UserModel[]> {
    return this.repository.find();
  }

  public async getUserById(id: Uuid): Promise<UserModel | undefined> {
    return this.repository
      .createQueryBuilder("user")
      .where("user.id = :id", { id })
      .getOne();
  }

  public async getUserByGoogleId(googleId: Uuid): Promise<UserModel | undefined> {
    return this.repository
      .createQueryBuilder("user")
      .where("user.googleId = :googleId", { googleId })
      .getOne();
  }

  public async getUserByEmail(email: string): Promise<UserModel | undefined> {
    return this.repository
      .createQueryBuilder("user")
      .where("user.email = :email", { email })
      .getOne();
  }

  public async createUser(
    firstName: string,
    lastName: string,
    profilePictureUrl: string,
    venmoHandle: string,
    email: string,
    googleId: string,
    bio?: string,
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

    existingUser = this.repository
      .createQueryBuilder("user")
      .where("user.venmoHandle = :venmoHandle", { venmoHandle })
      .getOne();
    if (await existingUser) throw Error('UserModel with same venmo handle already exists!');

    const user = new UserModel();
    user.firstName = firstName;
    user.lastName = lastName;
    user.profilePictureUrl = profilePictureUrl;
    user.venmoHandle = venmoHandle;
    user.bio = bio || user.bio;
    user.email = email;
    user.googleId = googleId;
    this.repository.save(user);
    return user;
  }

  public async deleteUser(user: UserModel): Promise<UserModel> {
    return this.repository.remove(user);
  }
}