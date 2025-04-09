import { AbstractRepository, EntityRepository } from 'typeorm';

import { PostModel } from '../models/PostModel';
import { UserModel } from '../models/UserModel';
import { CategoryModel } from '../models/CategoryModel';
import { Uuid } from '../types';

@EntityRepository(PostModel)
export class PostRepository extends AbstractRepository<PostModel> {
  public async getAllPosts(): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .where("post.archive = false")
      .getMany();
  }

  public async getAllPostsPaginated(skip:number,limit:number): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .where("post.archive = false")
      .skip(skip)               // Skip previous pages
    .take(limit)
      .getMany();
  }

  public async getPostById(id: Uuid): Promise<PostModel | undefined> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .where("post.id = :id", { id })
      .getOne();
  }

  public async getPostsByUserId(userId: string): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .where("user.firebaseUid = :userId", { userId })
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
    categories: CategoryModel[],
    condition: string,
    price: number,
    images: string[],
    user: UserModel,
  ): Promise<PostModel> {
    const post = new PostModel();
    post.title = title;
    post.description = description;
    post.categories = categories;
    post.condition = condition;
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
      .leftJoinAndSelect("post.categories", "categories")
      .where("LOWER(post.title) like LOWER(:keywords)", { keywords: `%${keywords}%` })
      .andWhere("post.archive = false")
      .getMany();
  }

  public async searchPostsByDescription(keywords: string): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .where("LOWER(post.description) like LOWER(:keywords)", { keywords: `%${keywords}%` })
      .andWhere("post.archive = false")
      .getMany();
  }

  public async filterPostsByCategories(categories: string[]): Promise<PostModel[]> {
    // First identify posts that have any of the specified categories
    const postsWithFilteredCategories = await this.repository
      .createQueryBuilder("post")
      .select("post.id")
      .distinct(true)
      .innerJoin("post.categories", "category")
      .where("category.id IN (:...categories)", { categories })
      .andWhere("post.archive = false")
      .getMany();
    
    // Exit early if no posts match
    if (postsWithFilteredCategories.length === 0) {
      return [];
    }
    
    // Get the IDs of the matching posts
    const postIds = postsWithFilteredCategories.map(post => post.id);
    
    // Then fetch those posts with ALL their categories
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .where("post.id IN (:...postIds)", { postIds })
      .getMany();
  }

  public async filterPostsByPrice(lowerBound: number, upperBound: number): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .where("CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END >= :lowerBound", { lowerBound: lowerBound })
      .andWhere("CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END <= :upperBound", { upperBound: upperBound })
      .andWhere("post.archive = false")
      .getMany();
  }

  public async filterPriceHighToLow(): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .where("post.archive = false")
      .orderBy("CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END", "DESC")
      .getMany();
  }
  
  public async filterPriceLowToHigh(): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .where("post.archive = false")
      .orderBy("CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END", "ASC")
      .getMany();
  }

  public async filterNewlyListed(): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .where("post.archive = false")
      .orderBy("post.created", "DESC")
      .getMany();
  }

  public async filterByCondition(conditions: string[]): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .where("post.condition IN (:...conditions)", { conditions })
      .andWhere("post.archive = false")
      .getMany();
  }

  public async getArchivedPosts(): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .andWhere("post.archive = true")
      .getMany();
  }

  public async getArchivedPostsByUserId(userId: string): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .where("user.firebaseUid = :userId", { userId })
      .andWhere("post.archive = true")
      .getMany();
  }

  public async archivePost(post: PostModel): Promise<PostModel> {
    post.archive = true;
    return await this.repository.save(post)
  }

  public async archiveAllPostsByUserId(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(PostModel)
      .set({ archive: true })
      .where("user.firebaseUid = :userId", { userId })
      .execute();
  }

  public async editPostPrice(post: PostModel, new_price: number): Promise<PostModel> {
    post.altered_price = new_price
    return await this.repository.save(post)
  }

  public async markPostAsSold(post: PostModel): Promise<PostModel> {
    post.sold = true;
    return await this.repository.save(post)
  }

  public async getPostWithSaversById(id: Uuid): Promise<PostModel | undefined> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user") // Load the post's user
      .leftJoinAndSelect("post.savers", "savers") // Load the savers relationship
      .leftJoinAndSelect("post.categories", "categories") // Load the categories relationship
      .where("post.id = :id", { id })
      .getOne();
  }


}