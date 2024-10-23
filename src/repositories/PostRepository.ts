import { AbstractRepository, EntityRepository } from 'typeorm';

import { PostModel } from '../models/PostModel';
import { UserModel } from '../models/UserModel';
import { Uuid } from '../types';

@EntityRepository(PostModel)
export class PostRepository extends AbstractRepository<PostModel> {
  public async getAllPosts(): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .where("post.archive = false")
      .getMany();
  }

  public async getPostById(id: Uuid): Promise<PostModel | undefined> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .where("post.id = :id", { id })
      .getOne();
  }

  public async getPostsByUserId(userId: Uuid): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .where("user.id = :userId", { userId })
      .andWhere("post.archive = false")
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

  public async createPost(
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
    post.original_price = price;
    post.altered_price = price;
    post.images = images;
    post.archive = false;
    post.user = user;
    return await this.repository.save(post);
  }

  public async deletePost(post: PostModel): Promise<PostModel> {
    return await this.repository.remove(post);
  }

  public async searchPostsByTitle(keywords: string): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .where("LOWER(post.title) like LOWER(:keywords)", { keywords: `%${keywords}%` })
      .andWhere("post.archive = false")
      .getMany();
  }

  public async searchPostsByDescription(keywords: string): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .where("LOWER(post.description) like LOWER(:keywords)", { keywords: `%${keywords}%` })
      .andWhere("post.archive = false")
      .getMany();
  }

  public async filterPosts(category: string): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .where(":category = ANY (post.categories)", { category: category })
      .andWhere("post.archive = false")
      .getMany();
  }

  public async filterPostsByPrice(lowerBound: number, upperBound: number): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .where("CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END >= :lowerBound", { lowerBound: lowerBound })
      .andWhere("CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END <= :upperBound", { upperBound: upperBound })
      .andWhere("post.archive = false")
      .getMany();
  }

  public async getArchivedPosts(): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .andWhere("post.archive = true")
      .getMany();
  }

  public async getArchivedPostsByUserId(userId: Uuid): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .where("user.id = :userId", { userId })
      .andWhere("post.archive = true")
      .getMany();
  }

  public async archivePost(post: PostModel): Promise<PostModel> {
    post.archive = true;
    return await this.repository.save(post)
  }

  public async archiveAllPostsByUserId(userId: Uuid): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(PostModel)
      .set({ archive: true })
      .where("userId = :userId", { userId })
      .execute();
  }

  public async editPostPrice(post: PostModel, new_price: number): Promise<PostModel> {
    post.altered_price = new_price
    return await this.repository.save(post)
  }
}