import { AbstractRepository, EntityRepository } from 'typeorm';

import { UserModel } from '../models/UserModel';
import { Uuid } from '../types';

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
    if (await existingUser) throw Error('UserModel with same email already exists!');

    existingUser = this.repository
      .createQueryBuilder("user")
      .where("user.googleId = :googleId", { googleId })
      .getOne();
    if (await existingUser) throw Error('UserModel with same google ID already exists!');
    
    const user = new UserModel();
      user.givenName = givenName;
      user.familyName = familyName;
      user.photoUrl = photoUrl;
      user.email = email;
      user.googleId = googleId;
      this.repository.save(user);
      return user;
  }

  public async deleteUser(user: UserModel): Promise<UserModel> {
    return this.repository.remove(user);
  }
}