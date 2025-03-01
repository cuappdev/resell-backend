import { UserModel } from 'src/models/UserModel';
import { AbstractRepository, EntityRepository } from 'typeorm';

import { FcmTokenModel } from '../models/FcmTokenModel';
import { Uuid } from '../types';

@EntityRepository(FcmTokenModel)
export class FcmTokenRepository extends AbstractRepository<FcmTokenModel> {
  public async getTokensByUserId(userId: string): Promise<FcmTokenModel[]> {
    return await this.repository
      .createQueryBuilder("fcmToken")
      .leftJoinAndSelect("fcmToken.user", "user")
      .where("user.id = :userId", { userId })
      .getMany();
  }

  public async createFcmToken (
    fcmToken: string,
    notificationsEnabled: boolean,
    timestamp: Date,
    user: UserModel
  ): Promise<FcmTokenModel> {
    const token = this.repository.create({
      fcmToken,
      notificationsEnabled,
      timestamp,
      user,
    });
    await this.repository.save(token);
    return token;
  }

  public async deleteToken(token: FcmTokenModel): Promise<FcmTokenModel> {
    return this.repository.remove(token);
  }

  public async updateTokenTimestamp(token: FcmTokenModel, newTimestamp: Date): Promise<FcmTokenModel> {
    token.timestamp = newTimestamp;
    return this.repository.save(token);
  }
}