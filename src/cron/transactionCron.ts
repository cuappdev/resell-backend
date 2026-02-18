import cron from 'node-cron';
import { getManager } from 'typeorm';
import { NotifService } from '../services/NotifService';

/**
 * Cron job to check for transactions with past meeting times
 * and send confirmation notifications to buyers
 * 
 * Runs every 15 minutes
 */
export function startTransactionConfirmationCron() {
    // Cron expression: "*/15 * * * *" = every 15 minutes
    // Format: minute hour day-of-month month day-of-week
    //   */15 = every 15 minutes
    //   *    = every hour
    //   *    = every day of month
    //   *    = every month
    //   *    = every day of week

    cron.schedule('*/15 * * * *', async () => {
        console.log('[CRON] Checking for pending transaction confirmations...');

        try {
            const entityManager = getManager();
            const notifService = new NotifService(entityManager);

            const result = await notifService.sendPendingTransactionConfirmations();
            console.log('[CRON] Transaction confirmation check complete:', result.message);

            if (result.results && result.results.length > 0) {
                console.log('[CRON] Notifications sent:', result.results);
            }
        } catch (error) {
            console.error('[CRON] Error checking pending transactions:', error);
        }
    });

    console.log('[CRON] Transaction confirmation cron job started (runs every 15 minutes)');
}

/**
 * Alternative: Run every hour at minute 0
 * cron.schedule('0 * * * *', ...)
 * 
 * Alternative: Run every 5 minutes (for testing)
 * cron.schedule('* /5 * * * *', ...)
 * 
 * Alternative: Run once daily at 9 AM
 * cron.schedule('0 9 * * *', ...)
 */
