import { AbstractRepository, EntityRepository } from 'typeorm';

import { PostModel } from '../models/PostModel';
import { UserModel } from '../models/UserModel';
import { CategoryModel } from '../models/CategoryModel';
import { FilterPostsUnifiedRequest, Uuid } from '../types';
import Repositories from '.';
import pgvector from 'pgvector';

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
      .orderBy("post.created", "DESC")
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
    embedding: string,
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
    post.embedding = embedding;
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
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .innerJoin("post.categories", "category")
      .where("category.name IN (:...categories)", { categories })
      .andWhere("post.archive = false")
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

    public async filterPostsUnified(filterPostsUnifiedRequest: FilterPostsUnifiedRequest): Promise<PostModel[]> {
    const qb = this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .where("post.archive = false");

    // Categories
    if (filterPostsUnifiedRequest.categories && filterPostsUnifiedRequest.categories.length > 0) {
      qb.innerJoin("post.categories", "catFilter", "catFilter.name IN (:...categories)", {
        categories: filterPostsUnifiedRequest.categories,
      });
    }

    // Pricing
    if (filterPostsUnifiedRequest.price) {
      if (filterPostsUnifiedRequest.price.lowerBound !== undefined) {
        qb.andWhere(
          "(CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END) >= :lowerBound",
          { lowerBound: filterPostsUnifiedRequest.price.lowerBound }
        );
      }
      if (filterPostsUnifiedRequest.price.upperBound !== undefined) {
        qb.andWhere(
          "(CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END) <= :upperBound",
          { upperBound: filterPostsUnifiedRequest.price.upperBound }
        );
      }
    }

    // Condition
    if (filterPostsUnifiedRequest.condition) {
      qb.andWhere("post.condition = :condition", {
        condition: filterPostsUnifiedRequest.condition,
      });
    }

    // Sorting
    if (filterPostsUnifiedRequest.sortField && filterPostsUnifiedRequest.sortField !== "any") {
      switch (filterPostsUnifiedRequest.sortField) {
        case "priceLowToHigh":
          qb.orderBy(
            "(CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END)",
            "ASC"
          );
          break;
        case "priceHighToLow":
          qb.orderBy(
            "(CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END)",
            "DESC"
          );
          break;
        case "newlyListed":
          qb.orderBy("post.created", "DESC");
          break;
      }
    }

    return await qb.getMany();
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

  public async getSimilarPosts(queryEmbedding: number[], excludePostId: string): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .where("post.id != :excludePostId", { excludePostId })
      .orderBy("embedding <-> CAST(:embedding AS vector(512))")
      .setParameters({ embedding: pgvector.toSql(queryEmbedding) })
      .limit(10)
      .getMany();
  }  
  
  public async getSuggestedPosts(
    userId: string,
    limit: number = 10
  ): Promise<PostModel[]> {
    // This query implements the weighted scoring for suggested posts    
    // Using query for weight calc
    const posts = await this.repository.query(`
      WITH 
      -- Calculate recency score using exponential decay
      recency_scores AS (
        SELECT 
          p.id,
          EXP(-(EXTRACT(EPOCH FROM (NOW() - p.created)) / 86400)) AS recency_score
        FROM "Post" p
        WHERE p.archive = false AND p.sold = false
      ),
      
      -- Get search history matches (weight: 1)
      search_matches AS (
        SELECT DISTINCT
          p.id,
          1 AS search_score
        FROM "Post" p
        JOIN "searches" s ON 
          (LOWER(p.title) LIKE LOWER('%' || s."searchText" || '%') OR 
           LOWER(p.description) LIKE LOWER('%' || s."searchText" || '%'))
        WHERE s."firebaseUid" = $1 AND p.archive = false AND p.sold = false
      ),
      
      -- Get purchase history matches (weight: 2)
      purchase_matches AS (
        SELECT DISTINCT
          p.id,
          2 AS purchase_score
        FROM "Post" p
        JOIN "Transaction" t ON t.buyer_id = $1
        JOIN "Post" bought_post ON t.post_id = bought_post.id
        WHERE p.category = bought_post.category 
          AND p.archive = false 
          AND p.sold = false
      ),
      
      -- Get bookmark matches (weight: 3)
      bookmark_matches AS (
        SELECT DISTINCT
          p.id,
          3 AS bookmark_score
        FROM "Post" p
        JOIN "user_saved_posts" usp ON usp.saved = p.id
        WHERE usp.savers = $1 AND p.archive = false AND p.sold = false
      ),
      
      -- Combine all scores
      combined_scores AS (
        SELECT 
          p.id,
          COALESCE(r.recency_score, 0) * 2 AS weighted_recency,
          COALESCE(s.search_score, 0) * 3 AS weighted_search,
          COALESCE(pm.purchase_score, 0) * 1 AS weighted_purchase,
          COALESCE(b.bookmark_score, 0) * 2 AS weighted_bookmark,
          (COALESCE(r.recency_score, 0) * 2) + 
          (COALESCE(s.search_score, 0) * 3) + 
          (COALESCE(pm.purchase_score, 0) * 1) + 
          (COALESCE(b.bookmark_score, 0) * 2) AS total_score
        FROM "Post" p
        LEFT JOIN recency_scores r ON p.id = r.id
        LEFT JOIN search_matches s ON p.id = s.id
        LEFT JOIN purchase_matches pm ON p.id = pm.id
        LEFT JOIN bookmark_matches b ON p.id = b.id
        WHERE p.archive = false AND p.sold = false
      )
      
      -- Select posts with user info, ordered by total score
      SELECT p.* 
      FROM "Post" p
      JOIN combined_scores cs ON p.id = cs.id
      WHERE p.archive = false AND p.sold = false
      ORDER BY cs.total_score DESC, p.created DESC
      LIMIT $2;
    `, [userId, limit]);
    
    // Convert query res to PostModel entities
    return await Promise.all(
      posts.map(async (post: any) => {
        const fullPost = await this.getPostById(post.id);
        return fullPost!;
      })
    );
  }
}