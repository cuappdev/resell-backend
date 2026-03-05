import { UserModel } from "src/models/UserModel";
import { AbstractRepository, DeleteResult, EntityRepository } from "typeorm";

import { FcmTokenModel } from "../models/FcmTokenModel";
import { TokenWrapper, Uuid } from "../types";

@EntityRepository(FcmTokenModel)
export class FcmTokenRepository extends AbstractRepository<FcmTokenModel> {
  public async getTokensByUserId(userId: string): Promise<TokenWrapper[]> {
    return await this.repository
      .createQueryBuilder("fcmToken")
      .select("fcmToken.fcmToken", "token")
      .leftJoin("fcmToken.user", "user")
      .where("user.firebaseUid = :userId", { userId })
      .groupBy("fcmToken.fcmToken")
      .getRawMany();
  }

  public async createFcmToken(
    fcmToken: string,
    notificationsEnabled: boolean,
    timestamp: Date,
    user: UserModel,
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

  public async getTokenByFcmToken(
    fcmToken: string,
  ): Promise<FcmTokenModel | undefined> {
    return await this.repository
      .createQueryBuilder("fcmToken")
      .where("fcmToken.fcmToken = :fcmToken", { fcmToken })
      .getOne();
  }

  public async deleteToken(token: FcmTokenModel): Promise<FcmTokenModel> {
    return this.repository.remove(token);
  }

  public async deleteAllTokensByUserId(userId: string): Promise<DeleteResult> {
    return this.repository.delete({ user: { firebaseUid: userId } });
  }

  public async updateTokenTimestamp(
    token: FcmTokenModel,
    newTimestamp: Date,
  ): Promise<FcmTokenModel> {
    token.timestamp = newTimestamp;
    return this.repository.save(token);
  }
}
