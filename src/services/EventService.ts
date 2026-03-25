import { NotFoundError } from "routing-controllers";
import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { InjectManager } from "typeorm-typedi-extensions";

import { UserModel } from "../models/UserModel";
import { EventTagModel } from "../models/EventTagModel";
import { EventPostSource } from "../models/EventPostModel";
import Repositories, { TransactionsManager } from "../repositories";
import { GetEventPostsResponse, PostWithSource } from "../types";

@Service()
export class EventService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  /**
   * Returns paginated posts for an event, combining user-tagged and similarity layers.
   * Ordering: user-tagged (by recency) first, then similarity (by relevance score).
   * Optionally filtered to a single source layer.
   */
  public async getEventPosts(
    user: UserModel,
    eventTagId: string,
    page: number = 1,
    limit: number = 10,
    source?: EventPostSource,
  ): Promise<GetEventPostsResponse> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const eventTagRepo = Repositories.eventTag(transactionalEntityManager);
      const eventPostRepo = Repositories.eventPost(transactionalEntityManager);
      const userRepo = Repositories.user(transactionalEntityManager);

      // Validate event tag exists
      const matches = await eventTagRepo.findByIds([eventTagId]);
      if (matches.length === 0) throw new NotFoundError('Event not found!');

      const skip = (page - 1) * limit;

      // Fetch paginated relationships and total count in parallel
      const [relationships, total] = await Promise.all([
        eventPostRepo.getPostsForEvent(eventTagId, source, skip, limit),
        eventPostRepo.getPostCountForEvent(eventTagId, source),
      ]);

      // Filter inactive and blocked users
      const userWithBlockedInfo = await userRepo.getUserWithBlockedInfo(user.firebaseUid);
      const blockedUids = new Set(
        userWithBlockedInfo?.blocking?.map(u => u.firebaseUid) ?? [],
      );

      const filtered = relationships.filter(r =>
        r.post?.user?.isActive &&
        !blockedUids.has(r.post.user.firebaseUid),
      );

      // Attach source + relevanceScore to each post
      const posts: PostWithSource[] = filtered.map(r =>
        Object.assign(r.post, {
          source: r.source,
          relevanceScore: r.relevanceScore,
        }),
      );

      return { posts, total, page, limit };
    });
  }

  /**
   * Returns all event tags available for user tagging.
   * Future: filter by isActive or displayStartDate once activation logic is added.
   */
  public async getAvailableEventTags(): Promise<EventTagModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      return Repositories.eventTag(transactionalEntityManager).getAllEventTags();
    });
  }
}
