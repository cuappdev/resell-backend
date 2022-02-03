import { getRepository, Repository } from "typeorm";

import Post from "../models/PostModel";
import User from "../models/UserModel";

const repo = (): Repository<Post> => getRepository(Post);

const createPost = async (
  title: string,
  description: string,
  images: string[],
  location: string,
  user: User,
): Promise<Post> => {
  const post = repo().create({
    title,
    description,
    images,
    location,
    user
  });
  await repo().save(post);
  return post;
};

const deletePost = async (id: string): Promise<boolean> => {
  const post = await getPostById(id);
  if (!post) return false;
  await repo().remove(post);
  return true;
};

const getPostById = async (id: string): Promise<Post | undefined> => {
  const post = await repo()
    .createQueryBuilder("post")
    .where("post.id=:id", { id })
    .getOne();
  return post;
};

const getPostsByUserId = async (userId: string): Promise<Post[]> => {
  return await repo()
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.user", "user")
    .where("user.id = :userId", { userId })
    .getMany();
};

const getUserByPostId = async (id: string): Promise<User | undefined> => {
  const post = await repo()
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.user", "user")
    .where("post.id = :id", { id })
    .getOne();
  return post?.user;
};

export default {
  createPost,
  deletePost,
  getPostById,
  getPostsByUserId,
  getUserByPostId
};