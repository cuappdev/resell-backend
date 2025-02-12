import { AbstractRepository, EntityRepository } from 'typeorm';

import { UserModel } from '../models/UserModel';
import { UserSessionModel } from '../models/UserSessionModel';
import { Uuid } from '../types';

@EntityRepository(UserSessionModel)
export class UserSessionRepository extends AbstractRepository<UserSessionModel> {

  public async createSession(user: UserModel): Promise<UserSessionModel> {
    const session = new UserSessionModel();
    session.user = user;
    session.userId = user.id;
    session.update();
    await this.repository.save(session);
    return session;
  }

  public async deleteSessionByAccessToken(accessToken: string): Promise<boolean> {
    const session = await this.repository
      .createQueryBuilder("UserSessionModel")
      .where("UserSessionModel.accessToken = :accessToken", { accessToken })
      .getOne();
    if (!session) return false;
    await this.repository.remove(session);
    return true;
  }

  public async deleteSessionById(id: Uuid): Promise<boolean> {
    const session = await this.repository
      .createQueryBuilder("UserSessionModel")
      .where("UserSessionModel.id = :id", { id })
      .getOne();
    if (!session) return false;
    await this.repository.remove(session);
    return true;
  }

  public async deleteSessionByUserId(userId: string): Promise<boolean> {
    const sessions = await this.repository
      .createQueryBuilder("UserSessionModel")
      .leftJoinAndSelect("UserSessionModel.user", "user")
      .where("user.id = :userId", { userId })
      .getMany();
    for (const session of sessions) {
      if (!await this.repository.remove(session)) return false;
    }
    return true;
  }

  public async expireSession(session: UserSessionModel): Promise<UserSessionModel> {
    session.expiresAt = new Date(Date.now() - 7);
    await this.repository.save(session);
    return session;
  }

  public async getSessionById(id: Uuid): Promise<UserSessionModel | undefined> {
    return await this.repository
      .createQueryBuilder("UserSessionModel")
      .where("UserSessionModel.id = :id", { id })
      .getOne();
  }

  public async getSessionByToken(accessToken?: string, refreshToken?: string): Promise<UserSessionModel | undefined> {
    const token = accessToken || refreshToken;
    const session = await this.repository
      .createQueryBuilder("UserSessionModel")
      .where("UserSessionModel.accessToken = :accessToken", { accessToken: token })
      .orWhere("UserSessionModel.refreshToken = :refreshToken", { refreshToken: token })
      .getOne();
    return session;
  }

  public async getSessionsByUserId(userId: string): Promise<UserSessionModel[]> {
    return await this.repository
      .createQueryBuilder("UserSessionModel")
      .leftJoinAndSelect("UserSessionModel.user", "user")
      .where("user.id = :userId", { userId })
      .getMany();
  }

  public async getUserIdFromToken(accessToken: string): Promise<Uuid | undefined> {
    const verified = await this.verifySession(accessToken);
    if (!verified) return undefined;
    const session = await this.repository
      .createQueryBuilder("UserSessionModel")
      .leftJoinAndSelect("UserSessionModel.user", "user")
      .where("UserSessionModel.accessToken = :accessToken", { accessToken })
      .getOne();
    const userId = session?.user.id;
    return userId;
  }

  public async updateSession(refreshToken: string): Promise<UserSessionModel | undefined> {
    const session = await this.repository.findOne({ where: { refreshToken } });
    if (session) {
      session.update();
      await this.repository.save(session);
    }
    return session;
  }

  public async updateSessionFcmToken(session: UserSessionModel, fcmToken: string): Promise<UserSessionModel> {
    session.fcmToken = fcmToken;
    return await this.repository.save(session);
  }

  public async verifySession(accessToken: string): Promise<boolean> {
    const session = await this.repository
      .createQueryBuilder("UserSessionModel")
      .where("UserSessionModel.accessToken = :accessToken", { accessToken })
      .getOne();
    return session ? session.expiresAt.getTime() > Date.now() : false;
  }
}