import cron from 'node-cron';
import { getManager } from 'typeorm';
import { EventPostService } from '../services/EventPostService';
import { EventTagRepository } from '../repositories/EventTagRepository';

/**
 * Hourly cron that reprocesses similarity for every event tag.
 * For each tag it computes a centroid from user-tagged post embeddings
 * and upserts similar posts into the eventPosts table.
 */
export function startEventSimilarityCron() {
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Starting event similarity processing...');

    try {
      const entityManager = getManager();
      const eventTagRepo = entityManager.getCustomRepository(EventTagRepository);
      const eventTags = await eventTagRepo.getAllEventTags();

      if (eventTags.length === 0) {
        console.log('[CRON] No event tags found, skipping similarity processing.');
        return;
      }

      const eventPostService = new EventPostService(entityManager);

      for (const tag of eventTags) {
        try {
          await eventPostService.processEventSimilarity(tag.id);
          console.log(`[CRON] Similarity processed for event "${tag.name}" (${tag.id})`);
        } catch (err) {
          console.error(`[CRON] Error processing similarity for event "${tag.name}" (${tag.id}):`, err);
        }
      }

      console.log(`[CRON] Event similarity processing complete for ${eventTags.length} event(s).`);
    } catch (error) {
      console.error('[CRON] Fatal error in event similarity cron:', error);
    }
  });

  console.log('[CRON] Event similarity cron job started (runs every hour at :00)');
}
