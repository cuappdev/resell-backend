import { getRepository, Repository } from "typeorm";

import Post from "../models/PostModel";
import User from "../models/UserModel";
import Image from "../models/ImageModel";

const repo = (): Repository<Post> => getRepository(Post);

async function getPostById(id: string): Promise<Post | undefined> {
  const post = await repo().createQueryBuilder("post").leftJoinAndSelect("post.user", "user").where("post.id=:id", { id }).getOne()
  return post
}


async function createPost(
  title: string,
  description: string,
  location: string,
  user: User,
  images: Image[],
): Promise<Post> {
  const post = repo().create({
    title,
    description,
    location,
    user,
    images,
  });
  await repo().save(post);
  return post;
}

async function deletePost(post: Post): Promise<boolean> {
  await repo().delete(post);
  return true;
}

export default {
  createPost,
  deletePost,
  getPostById
};