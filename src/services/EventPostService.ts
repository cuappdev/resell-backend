import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { InjectManager } from "typeorm-typedi-extensions";

import Repositories, { TransactionsManager } from "../repositories";

@Service()
export class EventPostService {
  readonly SIMILARITY_THRESHOLD = 0.7;
  readonly MAX_RESULTS = 100;

  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  /**
   * Finds posts similar to the user-tagged posts for an event and saves them
   * as similarity relationships. Clears stale similarity rows before reprocessing.
   *
   * Returns early if no user-tagged posts exist or none have embeddings.
   */
  public async processEventSimilarity(eventTagId: string): Promise<void> {
    if (process.env.NODE_ENV === "test") return;

    await this.transactions.readWrite(async (transactionalEntityManager) => {
      const eventPostRepo = Repositories.eventPost(transactionalEntityManager);
      const postRepo = Repositories.post(transactionalEntityManager);

      // Get all user-tagged posts for the event (with post + embedding loaded)
      const userTaggedRelationships =
        await eventPostRepo.getUserTaggedPostsForEvent(eventTagId);

      // Return early if no user-tagged posts
      if (userTaggedRelationships.length === 0) return;

      // Filter to posts that have embeddings
      const postsWithEmbeddings = userTaggedRelationships
        .filter(
          (r) =>
            r.post?.embedding != null &&
            Array.isArray(r.post.embedding) &&
            r.post.embedding.length > 0,
        )
        .map((r) => r.post.embedding as number[]);

      // Return early if no embeddings available
      if (postsWithEmbeddings.length === 0) return;

      // Compute centroid embedding
      const centroid = this.computeCentroid(postsWithEmbeddings);

      const userTaggedPostIds = userTaggedRelationships.map((r) => r.postId);

      // Find similar posts via pgvector cosine distance
      const similarPosts = await postRepo.findSimilarPostsForEvent(
        centroid,
        userTaggedPostIds,
        this.SIMILARITY_THRESHOLD,
        this.MAX_RESULTS,
      );

      // Clear stale similarity rows before saving new results
      await eventPostRepo.deleteRelationshipsBySourceForEvent(
        eventTagId,
        "similarity",
      );

      // Save new similarity relationships
      for (const { post, score } of similarPosts) {
        await eventPostRepo.upsertRelationship(
          post.id,
          eventTagId,
          "similarity",
          score,
        );
      }
    });
  }

  /**
   * Computes the element-wise mean of a list of embeddings.
   * The resulting centroid represents the average semantic direction
   * of all user-tagged posts for an event.
   */
  private computeCentroid(embeddings: number[][]): number[] {
    const dim = embeddings[0].length;
    const centroid = new Array(dim).fill(0);

    for (const embedding of embeddings) {
      for (let i = 0; i < dim; i++) {
        centroid[i] += embedding[i];
      }
    }

    return centroid.map((v) => v / embeddings.length);
  }
}
