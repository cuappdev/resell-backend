import { Connection, createConnection } from 'typeorm';

// import { models } from '../../models';

export class DatabaseConnection {
  private static conn: Connection | null = null;

  public static async connect(): Promise<Connection> {
    if (!DatabaseConnection.conn) {
      DatabaseConnection.conn = await createConnection({
        database: 'resell-test',
        entities: [__dirname + '/../models/*.ts'],
        host: 'localhost',
        logging: false,
        password: 'postgres',
        port: 5432,
        synchronize: true,
        type: 'postgres',
        username: 'postgres',
      });
      // Ensure pgvector extension is installed for tests
      await DatabaseConnection.conn.query('CREATE EXTENSION IF NOT EXISTS vector');
    }
    return DatabaseConnection.conn;
  }

  public static async clear(): Promise<void> {
    const conn = await DatabaseConnection.connect();
    await conn.transaction(async (txn) => {
      // the order of elements matters here, since this will be the order of deletion.
      // if a table (A) exists with an fkey to another table (B), make sure B is listed higher than A.
      const tableNames = [
        'TransactionReview',
        'Transaction',
        'Feedback',
        'notifications', // Add notifications table before User since it has a fk to User
        'Report', // Add Report table before Post since it has a fk to Post
        'Post',
        'FCMToken',
        'Request',
        'UserReview',
        'User'
      ];
      await Promise.all(tableNames.map((t) => txn.query(`DELETE FROM "${t}"`)));
    });
  }

  public static async close(): Promise<void> {
    if (!DatabaseConnection.conn) return;
    await DatabaseConnection.conn.close();
  }
}