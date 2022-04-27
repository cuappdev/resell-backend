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
    return await this.repository
    .createQueryBuilder("post")
    .where("post.id=:id", { id })
    .getOne();
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
    categories: string[],
    price: number,
    images: string[],
    user: UserModel,
  ): Promise<PostModel> {
    const post = new PostModel();
    post.title = title;
    post.description = description;
    post.categories = categories;
    post.price = price;
    post.images = images;
    post.user = user;
    return await this.repository.save(post);
  }

  public async deletePost(post: PostModel): Promise<PostModel> {
    return this.repository.remove(post);
  }

  public async searchPostsByTitle(keywords: string): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .where("post.title like :keywords", {keywords: `%${keywords}%`})
      .getMany();
  }

  public async searchPostsByDescription(keywords: string): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .where("post.description like :keywords", {keywords: `%${keywords}%`})
      .getMany();
  }

  public async filterPosts(category: string): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .where(":category = ANY (post.categories)", {category: category})
      .getMany();
  }
}