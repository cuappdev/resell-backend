import { AbstractRepository, EntityRepository } from "typeorm";

import { PostModel } from '../models/PostModel';
import { UserModel } from '../models/UserModel';
import { CategoryModel } from '../models/CategoryModel';
import { EventTagModel } from '../models/EventTagModel';
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
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("post.archive = false")
      .orderBy("categories.name", "ASC")
      .getMany();
  }

  public async getAllPostsPaginated(
    skip: number,
    limit: number,
  ): Promise<PostModel[]> {
    // Step 1: Get paginated post IDs
    const postIds = await this.repository
      .createQueryBuilder("post")
      .select("post.id")
      .where("post.archive = false")
      .orderBy("post.created", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    const ids = postIds.map((post) => post.id);
    if (ids.length === 0) return [];

    // Step 2: Fetch full posts with relations
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("post.id IN (:...ids)", { ids })
      .orderBy("post.created", "DESC")
      .getMany();
  }

  public async getPostById(id: string): Promise<PostModel | undefined> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("post.id = :id", { id })
      .orderBy("categories.name", "ASC")
      .getOne();
  }

  public async getPostsByUserId(userId: string): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("user.firebaseUid = :userId", { userId })
      .andWhere("post.archive = false")
      .orderBy("categories.name", "ASC")
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
    eventTags: EventTagModel[],
    condition: string,
    price: number,
    images: string[],
    user: UserModel,
    embedding: number[],
  ): Promise<PostModel> {
    const post = new PostModel();
    post.title = title;
    post.description = description;
    post.categories = categories;
    post.eventTags = eventTags;
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
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("LOWER(post.title) like LOWER(:keywords)", { keywords: `%${keywords}%` })
      .andWhere("post.archive = false")
      .orderBy("categories.name", "ASC")
      .getMany();
  }

  public async searchPostsByDescription(
    keywords: string,
  ): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("LOWER(post.description) like LOWER(:keywords)", { keywords: `%${keywords}%` })
      .andWhere("post.archive = false")
      .orderBy("categories.name", "ASC")
      .getMany();
  }

  public async filterPostsByCategories(
    categories: string[],
    skip: number,
    limit: number,
  ): Promise<PostModel[]> {
    const postIds = await this.repository
      .createQueryBuilder("post")
      .select("post.id")
      .innerJoin("post.categories", "category")
      .where("category.name IN (:...categories)", { categories })
      .andWhere("post.archive = false")
      .skip(skip)
      .take(limit)
      .getMany();

    const ids = postIds.map((post) => post.id);
    if (ids.length === 0) return [];

    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("post.id IN (:...ids)", { ids })
      .getMany();
  }

  public async filterPostsByEventTags(eventTags: string[], skip: number, limit: number): Promise<PostModel[]> {
    const postIds = await this.repository
      .createQueryBuilder("post")
      .select("post.id")
      .innerJoin("post.eventTags", "eventTag")
      .where("eventTag.name IN (:...eventTags)", { eventTags })
      .andWhere("post.archive = false")
      .skip(skip)
      .take(limit)
      .getMany();

    const ids = postIds.map(post => post.id);
    if (ids.length === 0) return [];

    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("post.id IN (:...ids)", { ids })
      .getMany();
  }

  public async filterPostsByPrice(
    lowerBound: number,
    upperBound: number,
    skip: number,
    limit: number,
  ): Promise<PostModel[]> {
    const postIds = await this.repository
      .createQueryBuilder("post")
      .select("post.id")
      .where(
        "CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END >= :lowerBound",
        { lowerBound: lowerBound },
      )
      .andWhere(
        "CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END <= :upperBound",
        { upperBound: upperBound },
      )
      .andWhere("post.archive = false")
      .skip(skip)
      .take(limit)
      .getMany();

    const ids = postIds.map((post) => post.id);
    if (ids.length === 0) return [];

    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("post.id IN (:...ids)", { ids })
      .orderBy("categories.name", "ASC")
      .getMany();
  }

  public async filterPriceHighToLow(
    skip: number,
    limit: number,
  ): Promise<PostModel[]> {
    const postIds = await this.repository
      .createQueryBuilder("post")
      .select("post.id")
      .where("post.archive = false")
      .orderBy(
        "CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END",
        "DESC",
      )
      .skip(skip)
      .take(limit)
      .getMany();

    const ids = postIds.map((post) => post.id);
    if (ids.length === 0) return [];

    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("post.id IN (:...ids)", { ids })
      .orderBy(
        "CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END",
        "DESC",
      )
      .addOrderBy("categories.name", "ASC")
      .getMany();
  }

  public async filterPriceLowToHigh(
    skip: number,
    limit: number,
  ): Promise<PostModel[]> {
    const postIds = await this.repository
      .createQueryBuilder("post")
      .select("post.id")
      .where("post.archive = false")
      .orderBy(
        "CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END",
        "ASC",
      )
      .skip(skip)
      .take(limit)
      .getMany();

    const ids = postIds.map((post) => post.id);
    if (ids.length === 0) return [];

    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("post.id IN (:...ids)", { ids })
      .orderBy(
        "CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END",
        "ASC",
      )
      .addOrderBy("categories.name", "ASC")
      .getMany();
  }

  public async filterNewlyListed(
    skip: number,
    limit: number,
  ): Promise<PostModel[]> {
    const postIds = await this.repository
      .createQueryBuilder("post")
      .select("post.id")
      .where("post.archive = false")
      .orderBy("post.created", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    const ids = postIds.map((post) => post.id);
    if (ids.length === 0) return [];

    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("post.id IN (:...ids)", { ids })
      .orderBy("post.created", "DESC")
      .getMany();
  }

  public async filterDateNewToOld(): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("post.archive = false")
      .orderBy("post.created", "DESC")
      .addOrderBy("categories.name", "ASC")
      .getMany();
  }

  public async filterByCondition(
    conditions: string[],
    skip: number,
    limit: number,
  ): Promise<PostModel[]> {
    const postIds = await this.repository
      .createQueryBuilder("post")
      .select("post.id")
      .where("post.condition IN (:...conditions)", { conditions })
      .andWhere("post.archive = false")
      .skip(skip)
      .take(limit)
      .getMany();

    const ids = postIds.map((post) => post.id);
    if (ids.length === 0) return [];

    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("post.id IN (:...ids)", { ids })
      .orderBy("categories.name", "ASC")
      .getMany();
  }

  public async filterPostsUnified(
    filterPostsUnifiedRequest: FilterPostsUnifiedRequest,
    skip: number,
    limit: number,
  ): Promise<PostModel[]> {
    const qb = this.repository
      .createQueryBuilder("post")
      .select("post.id")
      .where("post.archive = false");

    // Categories
    if (
      filterPostsUnifiedRequest.categories &&
      filterPostsUnifiedRequest.categories.length > 0
    ) {
      qb.innerJoin(
        "post.categories",
        "catFilter",
        "catFilter.name IN (:...categories)",
        {
          categories: filterPostsUnifiedRequest.categories,
        },
      );
    }

    // Pricing
    if (filterPostsUnifiedRequest.price) {
      if (filterPostsUnifiedRequest.price.lowerBound !== undefined) {
        qb.andWhere(
          "(CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END) >= :lowerBound",
          { lowerBound: filterPostsUnifiedRequest.price.lowerBound },
        );
      }
      if (filterPostsUnifiedRequest.price.upperBound !== undefined) {
        qb.andWhere(
          "(CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END) <= :upperBound",
          { upperBound: filterPostsUnifiedRequest.price.upperBound },
        );
      }
    }

    // Condition
    if (
      filterPostsUnifiedRequest.condition &&
      filterPostsUnifiedRequest.condition.length > 0
    ) {
      qb.andWhere("post.condition IN (:...conditions)", {
        conditions: filterPostsUnifiedRequest.condition,
      });
    }

    // Sorting
    if (
      filterPostsUnifiedRequest.sortField &&
      filterPostsUnifiedRequest.sortField !== "any"
    ) {
      switch (filterPostsUnifiedRequest.sortField) {
        case "priceLowToHigh":
          qb.orderBy(
            "(CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END)",
            "ASC",
          );
          break;
        case "priceHighToLow":
          qb.orderBy(
            "(CASE WHEN post.altered_price = -1 THEN post.original_price ELSE post.altered_price END)",
            "DESC",
          );
          break;
        case "newlyListed":
          qb.orderBy("post.created", "DESC");
          break;
      }
    }

    qb.skip(skip).take(limit);

    const postIds = await qb.getMany();
    const ids = postIds.map((post) => post.id);
    if (ids.length === 0) return [];

    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("post.id IN (:...ids)", { ids })
      .getMany();
  }

  public async getAllArchivedPosts(): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .andWhere("post.archive = true")
      .orderBy("categories.name", "ASC")
      .getMany();
  }

  public async getArchivedPostsByUserId(userId: string): Promise<PostModel[]> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .where("user.firebaseUid = :userId", { userId })
      .andWhere("post.archive = true")
      .orderBy("categories.name", "ASC")
      .getMany();
  }

  public async archivePost(post: PostModel): Promise<PostModel> {
    post.archive = true;
    return await this.repository.save(post);
  }

  public async archiveAllPostsByUserId(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder("post")
      .leftJoin("post.user", "user")
      .update(PostModel)
      .set({ archive: true })
      .where("user.firebaseUid = :userId", { userId })
      .execute();
  }

  public async editPostPrice(
    post: PostModel,
    new_price: number,
  ): Promise<PostModel> {
    post.altered_price = new_price;
    return await this.repository.save(post);
  }

  public async savePost(post: PostModel): Promise<PostModel> {
    return await this.repository.save(post);
  }

  public async markPostAsSold(post: PostModel): Promise<PostModel> {
    post.sold = true;
    return await this.repository.save(post);
  }

  public async getPostWithSaversById(id: Uuid): Promise<PostModel | undefined> {
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user") // Load the post's user
      .leftJoinAndSelect("post.savers", "savers") // Load the savers relationship
      .leftJoinAndSelect("post.categories", "categories") // Load the categories relationship
      .leftJoinAndSelect("post.eventTags", "eventTags") // Load the event tags relationship
      .where("post.id = :id", { id })
      .getOne();
  }

  /*
  This method is for getting similar posts for a given post query embedding.
  */
  public async getSimilarPosts(
    queryEmbedding: number[],
    excludePostId: string,
    excludeUserId: string,
  ): Promise<PostModel[]> {
    const lit = `[${queryEmbedding.join(",")}]`;
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .where("post.id != :excludePostId", { excludePostId })
      .andWhere("user.firebaseUid != :excludeUserId", { excludeUserId })
      .orderBy(`embedding::vector <-> CAST('${lit}' AS vector(512))`)
      .setParameters({ embedding: queryEmbedding })
      .limit(10)
      .getMany();
  }

  /*
  This method is for getting similar posts given a request embedding.
  */
  public async findSimilarPosts(
    embedding: number[],
    excludeUserId: string,
    limit = 10,
  ): Promise<PostModel[]> {
    const lit = `[${embedding.join(",")}]`;
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .where("post.embedding IS NOT NULL")
      .andWhere("user.firebaseUid != :excludeUserId", { excludeUserId })
      .orderBy(`post.embedding::vector <-> CAST('${lit}' AS vector(512))`)
      .limit(limit)
      .getMany();
  }

  public async getSuggestedPosts(
    userId: string,
    limit = 10,
  ): Promise<PostModel[]> {
    // This query implements the weighted scoring for suggested posts
    // Using query for weight calc
    const posts = await this.repository.query(
      `
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
        JOIN "post_categories" pc ON pc.posts = p.id
        JOIN "Transaction" t ON t.buyer_id = $1
        JOIN "Post" bought_post ON t.post_id = bought_post.id
        JOIN "post_categories" bought_pc ON bought_pc.posts = bought_post.id
        WHERE pc.categories = bought_pc.categories
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
    `,
      [userId, limit],
    );

    // Convert query res to PostModel entities
    return await Promise.all(
      posts.map(async (post: any) => {
        const fullPost = await this.getPostById(post.id);
        if (!fullPost) {
          console.error(
            `Post with ID ${post.id} found in suggestion query but could not be retrieved fully.`,
          );
        }
        return fullPost;
      }),
    );
  }

  /*
  Get purchase suggestions based on vector similarity to average of user's purchase history.
  Uses pgvector's cosine distance operator to find similar posts efficiently.
  */
  public async getPurchaseSuggestions(
    avgEmbedding: number[],
    excludeUserId: string,
    limit = 10,
  ): Promise<PostModel[]> {
    const lit = `[${avgEmbedding.join(",")}]`;
    return await this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .where("post.embedding IS NOT NULL")
      .andWhere("post.archive = false")
      .andWhere("post.sold = false")
      .andWhere("user.firebaseUid != :excludeUserId", { excludeUserId })
      .orderBy(`post.embedding::vector <-> CAST('${lit}' AS vector(512))`)
      .limit(limit)
      .getMany();
  }
}
