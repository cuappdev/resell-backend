import { UserModel } from 'src/models/UserModel';
import { getRepository, Repository } from 'typeorm';

import UserSession from '../models/UserSessionModel';
import { Uuid } from '../types';

const repo = (): Repository<UserSession> => getRepository(UserSession);

const createSession = async (user: UserModel): Promise<UserSession> => {
  const session = new UserSession();
  session.user = user;
  session.update();
  await repo().save(session);
  return session;
};

const deleteSessionById = async (id: Uuid): Promise<boolean> => {
  const session = await repo()
    .createQueryBuilder("usersession")
    .where("usersession.id = :id", { id })
    .getOne();
  if (!session) return false;
  await repo().remove(session);
  return true;
};

const deleteSessionByUserId = async (userId: string): Promise<boolean> => {
  const sessions = await repo()
    .createQueryBuilder("usersession")
    .leftJoinAndSelect("usersession.user", "user")
    .where("user.id = :userId", { userId })
    .getMany();
  let allTrue = true;
  for (const session of sessions) {
    allTrue = allTrue && (await deleteSessionById(session.id));
  }
  return allTrue;
};

const expireSession = async (session: UserSession): Promise<UserSession> => {
  session.expiresAt = new Date(Date.now() - 1);
  await repo().save(session);
  return session;
};

const getSessionById = async (id: Uuid): Promise<UserSession | undefined> => {
  return await repo()
    .createQueryBuilder("usersession")
    .where("usersession.id = :id", { id })
    .getOne();
};

const getSessionByToken = async (accessToken?: string, refreshToken?: string): Promise<UserSession | undefined> => {
  const token = accessToken || refreshToken;
  const session = await repo()
    .createQueryBuilder("usersession")
    .where("usersession.accessToken = :accessToken", { accessToken: token })
    .orWhere("usersession.refreshToken = :refreshToken", { refreshToken: token })
    .getOne();
  return session;
};

const getSessionsByUserId = async (userId: string): Promise<UserSession[]> => {
  return await repo()
    .createQueryBuilder("usersession")
    .leftJoinAndSelect("usersession.user", "user")
    .where("user.id = :userId", { userId })
    .getMany();
};

const getUserFromToken = async (accessToken: string): Promise<UserModel | undefined> => {
  const verified = await verifySession(accessToken);
  if (!verified) return undefined;
  const session = await repo()
    .createQueryBuilder("usersession")
    .leftJoinAndSelect("usersession.user", "user")
    .where("usersession.accessToken = :accessToken", { accessToken })
    .getOne();
  const userId = session?.user.id;
  return undefined;
};

const updateSession = async (refreshToken: string): Promise<UserSession | undefined> => {
  const session = await repo().findOne({ where: { refreshToken } });
  if (session) {
    session.update();
    await repo().save(session);
  }
  return session;
};

const verifySession = async (accessToken: string): Promise<boolean> => {
  const session = await repo()
    .createQueryBuilder("usersession")
    .where("usersession.accessToken = :accessToken", { accessToken })
    .getOne();
  return session ? session.expiresAt.getTime() > Date.now() : false;
};

export default {
  createSession,
  deleteSessionById,
  deleteSessionByUserId,
  expireSession,
  getSessionById,
  getSessionByToken,
  getSessionsByUserId,
  getUserFromToken,
  updateSession,
  verifySession
};