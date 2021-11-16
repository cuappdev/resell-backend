import User from "src/models/UserModel";
import { getRepository, Repository } from "typeorm";

import UserSession from '../models/UserSession';

const repo = (): Repository<UserSession> => getRepository(UserSession);

async function getSessionById(id: string): Promise<UserSession | undefined> {
  return await repo().findOne(id);
}

async function getSessionByUserId(userId: string): Promise<UserSession | undefined> {
  return await repo()
    .createQueryBuilder("usersession")
    .leftJoinAndSelect("usersession.user", "user")
    .where("user.id = :userId", { userId })
    .getOne();
}

async function getUserFromToken(accessToken: string): Promise<User | undefined> {
  const session = await repo()
    .createQueryBuilder("usersession")
    .leftJoinAndSelect("usersession.user", "user")
    .where("usersession.accessToken = :accessToken", { accessToken })
    .getOne();
  return session?.user;
}