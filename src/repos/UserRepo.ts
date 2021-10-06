import { getRepository, Repository } from "typeorm";

import User from "../models/UserModel";

const repo = (): Repository<User> => getRepository(User);

async function getUserById(id: string): Promise<User | undefined> {
  return await repo().findOne(id);
}

async function getUserByEmail(email: string): Promise<User | undefined> {
  return await repo().findOne({ where: { email: email } });
}

async function getUserByGoogleId(googleId: string): Promise<User | undefined> {
  return await repo().findOne({ where: { googleId: googleId } });
}

async function createUser(
  googleId: string,
  fullName: string,
  displayName: string,
  email: string
): Promise<User> {
  const existingUser = await repo().findOne({ where: [{ googleId: googleId }, { email: email }] });
  if (existingUser) throw Error('User already exists!');
  const user = repo().create({
    googleId,
    fullName,
    displayName,
    email,
  });
  await repo().save(user);
  return user;
}

async function deleteUser(user: User): Promise<boolean> {
  await repo().delete(user);
  return true;
}

export default {
  createUser,
  deleteUser,
  getUserById,
  getUserByEmail,
  getUserByGoogleId
};