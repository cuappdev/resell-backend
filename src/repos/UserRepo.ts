import { getRepository, Repository } from "typeorm";

import User from "../models/UserModel";

const repo = (): Repository<User> => getRepository(User);

const getUserById = async (id: string): Promise<User | undefined> => {
  return await repo()
    .createQueryBuilder("user")
    .where("user.id = :id", { id })
    .getOne();
};

const getUserByEmail = async (email: string): Promise<User | undefined> => {
  return await repo()
    .createQueryBuilder("user")
    .where("user.email = :email", { email })
    .getOne();
};

const getUserByGoogleId = async (googleId: string): Promise<User | undefined> => {
  return await repo()
    .createQueryBuilder("user")
    .where("user.googleId = :googleId", { googleId })
    .getOne();
};

const createUser = async (
  email: string,
  googleId: string,
  name: string,
  profilePictureUrl: string,
  bio?: string
): Promise<User> => {
  let existingUser = await repo()
    .createQueryBuilder("user")
    .where("user.email = :email", { email })
    .getOne();
  if (existingUser) throw Error('User with same email already exists!');

  existingUser = await repo()
    .createQueryBuilder("user")
    .where("user.googleId = :googleId", { googleId })
    .getOne();
  if (existingUser) throw Error('User with same google ID already exists!');

  const user = new User();
  user.bio = bio || user.bio;
  user.email = email;
  user.googleId = googleId;
  user.name = name;
  user.profilePictureUrl = profilePictureUrl;
  await repo().save(user);
  return user;
};

const createDummyUser = async (tag: string): Promise<User> => {
  const user = new User();
  user.bio = `bio-${tag}`;
  user.email = `email-${tag}`;
  user.googleId = `googleId-${tag}`;
  user.name = `name-${tag}`;
  user.profilePictureUrl = `pfp-${tag}`;
  await repo().save(user);
  return user;
};

const deleteUserById = async (id: string): Promise<boolean> => {
  const user = await repo()
    .createQueryBuilder("user")
    .where("user.id = :id", { id })
    .getOne();
  if (!user) return false;
  await repo().remove(user);
  return true;
};

export default {
  createUser,
  createDummyUser,
  deleteUserById,
  getUserById,
  getUserByEmail,
  getUserByGoogleId
};