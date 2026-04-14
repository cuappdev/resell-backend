import { AbstractRepository, EntityRepository } from 'typeorm';

import { EventPostModel, EventPostSource } from '../models/EventPostModel';

@EntityRepository(EventPostModel)
export class EventPostRepository extends AbstractRepository<EventPostModel> {

  /**
   * Create or update a post-event relationship.
   */
  public async upsertRelationship(
    postId: string,
    eventTagId: string,
    source: EventPostSource,
    relevanceScore: number | null,
  ): Promise<EventPostModel> {
    const existing = await this.repository
      .createQueryBuilder("epr")
      .where("epr.postId = :postId", { postId })
      .andWhere("epr.eventTagId = :eventTagId", { eventTagId })
      .getOne();

    // User source takes priority (an existing user tag is never overwritten by an ML source)
    if (existing) {
      if (existing.source === 'user' && source !== 'user') {
        return existing;
      }
      existing.source = source;
      existing.relevanceScore = relevanceScore;
      return await this.repository.save(existing);
    }

    const relationship = this.repository.create({ postId, eventTagId, source, relevanceScore });
    return await this.repository.save(relationship);
  }

  /**
   * Get all user-tagged relationships for an event, with the post (including embedding) loaded.
   * Used as anchor points for similarity processing.
   */
  public async getUserTaggedPostsForEvent(eventTagId: string): Promise<EventPostModel[]> {
    return await this.repository
      .createQueryBuilder("epr")
      .leftJoinAndSelect("epr.post", "post")
      .where("epr.eventTagId = :eventTagId", { eventTagId })
      .andWhere("epr.source = 'user'")
      .getMany();
  }

  /**
   * Delete all relationships for an event matching a given source.
   * Called before reprocessing to clear stale ML results.
   */
  public async deleteRelationshipsBySourceForEvent(
    eventTagId: string,
    source: EventPostSource,
  ): Promise<void> {
    await this.repository.delete({ eventTagId, source });
  }

  /**
   * Delete a specific post-event relationship.
   * Called when a user removes an event tag from their post.
   */
  public async deleteRelationship(postId: string, eventTagId: string): Promise<void> {
    await this.repository.delete({ postId, eventTagId });
  }

  /**
   * Get paginated posts for an event, optionally filtered by source.
   * Ordered by layer priority: user-tagged (by post recency) first,
   * then similarity (by relevance score).
   */
  private static readonly SOURCE_PRIORITY_EXPR =
    `CASE "epr"."source" WHEN 'user' THEN 0 WHEN 'similarity' THEN 1 ELSE 2 END`;
  private static readonly SCORE_OR_RECENCY_EXPR =
    `CASE WHEN "epr"."source" = 'user' THEN EXTRACT(EPOCH FROM "post"."created") ELSE "epr"."relevanceScore" END`;

  public async getPostsForEvent(
    eventTagId: string,
    requestingUserId: string,
    source?: EventPostSource,
    skip: number = 0,
    limit: number = 10,
  ): Promise<EventPostModel[]> {
    const qb = this.repository
      .createQueryBuilder("epr")
      .select("epr.id")
      .addSelect(EventPostRepository.SOURCE_PRIORITY_EXPR, "source_priority")
      .addSelect(EventPostRepository.SCORE_OR_RECENCY_EXPR, "score_or_recency")
      .innerJoin("epr.post", "post")
      .innerJoin("post.user", "author")
      .where("epr.eventTagId = :eventTagId", { eventTagId })
      .andWhere("author.isActive = true")
      .andWhere(
        `author.firebaseUid NOT IN (SELECT "blocking" FROM "userBlockingUsers" WHERE "blockers" = :requestingUserId)`,
        { requestingUserId },
      );

    if (source) {
      qb.andWhere("epr.source = :source", { source });
    }

    qb
      .orderBy("source_priority", "ASC")
      .addOrderBy("score_or_recency", "DESC", "NULLS LAST")
      .skip(skip)
      .take(limit);

    const eprIds = await qb.getMany();
    const ids = eprIds.map((e) => e.id);
    if (ids.length === 0) return [];

    return await this.repository
      .createQueryBuilder("epr")
      .leftJoinAndSelect("epr.post", "post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.categories", "categories")
      .leftJoinAndSelect("post.eventTags", "eventTags")
      .addSelect(EventPostRepository.SOURCE_PRIORITY_EXPR, "source_priority")
      .addSelect(EventPostRepository.SCORE_OR_RECENCY_EXPR, "score_or_recency")
      .where("epr.id IN (:...ids)", { ids })
      .orderBy("source_priority", "ASC")
      .addOrderBy("score_or_recency", "DESC", "NULLS LAST")
      .getMany();
  }

  /**
   * Count posts for an event, optionally filtered by source.
   * Used for pagination totals.
   */
  public async getPostCountForEvent(
    eventTagId: string,
    requestingUserId: string,
    source?: EventPostSource,
  ): Promise<number> {
    const qb = this.repository
      .createQueryBuilder("epr")
      .innerJoin("epr.post", "post")
      .innerJoin("post.user", "author")
      .where("epr.eventTagId = :eventTagId", { eventTagId })
      .andWhere("author.isActive = true")
      .andWhere(
        `author.firebaseUid NOT IN (SELECT "blocking" FROM "userBlockingUsers" WHERE "blockers" = :requestingUserId)`,
        { requestingUserId },
      );

    if (source) {
      qb.andWhere("epr.source = :source", { source });
    }

    return await qb.getCount();
  }
}
