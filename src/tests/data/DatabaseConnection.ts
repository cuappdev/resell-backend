import { Connection, createConnection } from "typeorm";

import { models } from '../../models';

export class DatabaseConnection {
  private static conn: Connection | null = null;

  public static async connect(): Promise<Connection> {
    if (!DatabaseConnection.conn) {
      DatabaseConnection.conn = await createConnection({
        database: "resell-test",
        entities: models,
        host: "localhost",
        logging: false,
        password: "postgres",
        port: 5432,
        synchronize: true,
        type: "postgres",
        username: "postgres",
      });
      // Ensure pgvector is NOT required for tests.
      await DatabaseConnection.conn.query(
        `ALTER TABLE "userSavedPosts" ADD COLUMN IF NOT EXISTS "savedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
      await DatabaseConnection.conn.query(
        `ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "similarPostIds" uuid[]`,
      );
    }
    return DatabaseConnection.conn;
  }

  public static async clear(): Promise<void> {
    const conn = await DatabaseConnection.connect();
    const tableNames = [
      "TransactionReview",
      "Transaction",
      "Feedback",
      "notifications",
      "Report",
      "postCategories",
      "postEventTags",
      "postViews",
      "userSavedPosts",
      "Post",
      "Category",
      "EventTag",
      "FCMToken",
      "Request",
      "UserReview",
      "searches",
      "User",
    ];
    await conn.query(
      `TRUNCATE ${tableNames.map((t) => `"${t}"`).join(", ")} CASCADE`,
    );
  }

  public static async close(): Promise<void> {
    if (!DatabaseConnection.conn) return;
    await DatabaseConnection.conn.close();
  }
}
