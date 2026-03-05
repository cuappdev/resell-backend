import { MigrationInterface, QueryRunner } from "typeorm";

const RENAME_MAP: Array<{
  table: string;
  from: string;
  to: string;
}> = [
  { table: 'Transaction', from: 'transaction_date', to: 'transactionDate' },
  { table: 'Transaction', from: 'created_at', to: 'createdAt' },
  { table: 'Transaction', from: 'buyer_id', to: 'buyerId' },
  { table: 'Transaction', from: 'seller_id', to: 'sellerId' },
  { table: 'Transaction', from: 'post_id', to: 'postId' },

  { table: 'UserSession', from: 'access_token', to: 'accessToken' },
  { table: 'UserSession', from: 'expires_at', to: 'expiresAt' },
  { table: 'UserSession', from: 'refresh_token', to: 'refreshToken' },
  { table: 'UserSession', from: 'device_token', to: 'deviceToken' },
  { table: 'UserSession', from: 'user_id', to: 'userId' },

  { table: 'User', from: 'given_name', to: 'givenName' },
  { table: 'User', from: 'family_name', to: 'familyName' },
  { table: 'User', from: 'num_reviews', to: 'numReviews' },
  { table: 'User', from: 'photo_url', to: 'photoUrl' },
  { table: 'User', from: 'venmo_handle', to: 'venmoHandle' },
  { table: 'User', from: 'google_id', to: 'googleId' },

  { table: 'Post', from: 'original_price', to: 'originalPrice' },
  { table: 'Post', from: 'altered_price', to: 'alteredPrice' },
  { table: 'Post', from: 'user', to: 'userId' },

  { table: 'TransactionReview', from: 'transaction_id', to: 'transactionId' },
  { table: 'TransactionReview', from: 'had_issues', to: 'hadIssues' },
  { table: 'TransactionReview', from: 'issue_category', to: 'issueCategory' },
  { table: 'TransactionReview', from: 'issue_details', to: 'issueDetails' },
  { table: 'TransactionReview', from: 'created_at', to: 'createdAt' },

  { table: 'UserReview', from: 'buyer', to: 'buyerId' },
  { table: 'UserReview', from: 'seller', to: 'sellerId' },
  { table: 'Request', from: 'user', to: 'userId' },
  { table: 'Feedback', from: 'user', to: 'userId' },

  { table: 'Report', from: 'reporter_id', to: 'reporterFirebaseUid' },
  { table: 'Report', from: 'reported_id', to: 'reportedFirebaseUid' },
  { table: 'Report', from: 'post_id', to: 'postId' },
  { table: 'Report', from: 'message_id', to: 'messageId' },

  { table: 'notifications', from: 'user_id', to: 'userId' },
  { table: 'notifications', from: 'created_at', to: 'createdAt' },
  { table: 'notifications', from: 'updated_at', to: 'updatedAt' },
];

const TABLE_RENAME_MAP: Array<{ from: string; to: string }> = [
  { from: 'post_categories', to: 'postCategories' },
  { from: 'user_saved_posts', to: 'userSavedPosts' },
  { from: 'request_matches_posts', to: 'requestMatchesPosts' },
  { from: 'user_blocking_users', to: 'userBlockingUsers' },
  { from: 'post_event_tags', to: 'postEventTags' },
];

export class RenameSnakeToCamelResellTest1765000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // Drop leftover 'category' column that AddCategoryTable migration forgot to remove
    try {
      const categoryCol = await queryRunner.query(
        `SELECT column_name FROM information_schema.columns WHERE LOWER(table_name) = 'post' AND LOWER(column_name) = 'category'`,
      );
      if (categoryCol && categoryCol.length > 0) {
        await queryRunner.query(`ALTER TABLE "Post" DROP COLUMN "category"`);
      }
    } catch (e) {
      console.warn('drop category column error', e?.message ?? e);
    }

    // Rename snake_case tables to camelCase
    for (const { from, to } of TABLE_RENAME_MAP) {
      try {
        const exists = await queryRunner.query(
          `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND LOWER(tablename) = LOWER($1)`,
          [from],
        );
        if (exists && exists.length > 0) {
          await queryRunner.query(`ALTER TABLE "${from}" RENAME TO "${to}"`);
        }
      } catch (e) {
        console.warn('rename table error', from, to, e?.message ?? e);
      }
    }

    // Rename event_tags column in postEventTags junction table
    try {
      const col = await queryRunner.query(
        `SELECT column_name FROM information_schema.columns WHERE LOWER(table_name) = LOWER('postEventTags') AND column_name = 'event_tags'`,
      );
      if (col && col.length > 0) {
        await queryRunner.query(`ALTER TABLE "postEventTags" RENAME COLUMN "event_tags" TO "eventTags"`);
      }
    } catch (e) {
      console.warn('rename event_tags column error', e?.message ?? e);
    }

    // Rename snake_case columns to camelCase
    for (const { table, from, to } of RENAME_MAP) {
      try {
        const exists = await queryRunner.query(
          `SELECT column_name FROM information_schema.columns WHERE LOWER(table_name) = LOWER($1) AND LOWER(column_name) = LOWER($2)`,
          [table, from],
        );

        if (exists && exists.length > 0) {
          await queryRunner.query(`ALTER TABLE "${table}" RENAME COLUMN "${from}" TO "${to}"`);
        }
      } catch (e) {
        console.warn('rename-snake-to-camel up error', table, from, to, e?.message ?? e);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    // Reverse column renames
    for (const { table, from, to } of RENAME_MAP.slice().reverse()) {
      try {
        const exists = await queryRunner.query(
          `SELECT column_name FROM information_schema.columns WHERE LOWER(table_name) = LOWER($1) AND LOWER(column_name) = LOWER($2)`,
          [table, to],
        );

        if (exists && exists.length > 0) {
          await queryRunner.query(`ALTER TABLE "${table}" RENAME COLUMN "${to}" TO "${from}"`);
        }
      } catch (e) {
        console.warn('rename-snake-to-camel down error', table, from, to, e?.message ?? e);
      }
    }

    // Reverse event_tags column rename
    try {
      const col = await queryRunner.query(
        `SELECT column_name FROM information_schema.columns WHERE LOWER(table_name) = LOWER('postEventTags') AND column_name = 'eventTags'`,
      );
      if (col && col.length > 0) {
        await queryRunner.query(`ALTER TABLE "postEventTags" RENAME COLUMN "eventTags" TO "event_tags"`);
      }
    } catch (e) {
      console.warn('revert event_tags column error', e?.message ?? e);
    }

    // Reverse table renames
    for (const { from, to } of TABLE_RENAME_MAP.slice().reverse()) {
      try {
        const exists = await queryRunner.query(
          `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND LOWER(tablename) = LOWER($1)`,
          [to],
        );
        if (exists && exists.length > 0) {
          await queryRunner.query(`ALTER TABLE "${to}" RENAME TO "${from}"`);
        }
      } catch (e) {
        console.warn('revert table rename error', to, from, e?.message ?? e);
      }
    }
  }
}
