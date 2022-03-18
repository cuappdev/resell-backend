import { AbstractRepository, EntityRepository } from 'typeorm';

import { PostModel } from '../models/PostModel';
import { UserModel } from '../models/UserModel';
import { Uuid } from '../types';

@EntityRepository(PostModel)
export class PostRepository extends AbstractRepository<PostModel> {
  public async getAllPosts(): Promise<PostModel[]> {
    return await this.repository.createQueryBuilder("post")
    .leftJoinAndSelect("post.user", "user")
    .getMany();
  }

  public async getPostById(id: Uuid): Promise<PostModel | undefined> {
    const post = await this.repository
    .createQueryBuilder("post")
    .where("post.id=:id", { id })
    .getOne();
  return post;
  }

  public async getPostsByUserId(userId: Uuid): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .where("user.id = :userId", { userId })
      .getMany();
  }

  public async getUserByPostId(id: Uuid): Promise<UserModel | undefined> {
    const post = await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .where("post.id = :id", { id })
      .getOne();
    return post?.user;
  }

  public async createPost (
    title: string,
    description: string,
    price: number,
    images: string[],
    user: UserModel,
  ): Promise<PostModel> {
    const post = this.repository.create({
      title,
      description,
      price,
      images,
      user
    });
    await this.repository.save(post);
    return post;
  }

  public async deletePost(post: PostModel): Promise<PostModel> {
    return this.repository.remove(post);
  }

  public async searchPostsByTitle(keywords: String): Promise<PostModel[]> {
    const posts = await this.repository
      .createQueryBuilder("post")
      .where("post.title like :keywords", {keywords: `%${keywords}%`})
      .getMany();
    return posts;
  }

  public async searchPostsByDescription(keywords: String): Promise<PostModel[]> {
    const posts = await this.repository
      .createQueryBuilder("post")
      .where("post.description like :keywords", {keywords: `%${keywords}%`})
      .getMany();
    return posts;
  }
}