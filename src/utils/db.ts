import { Connection, createConnection } from 'typeorm';

import { PostModel } from '../models/PostModel';
import { UserModel } from '../models/UserModel';
import UserSession from '../models/UserSessionModel';

export default async function resellConnection(): Promise<Connection> {
  return await createConnection({
    database: 'resell-dev',
    entities: [UserModel, PostModel, UserSession],
    host: process.env.HOST,
    logging: 'all', //set to true to help with debugging
    password: process.env.DB_PASSWORD || 'postgres',
    port: +(process.env.PORT ?? 5432),
    synchronize: true,
    type: 'postgres',
    username: process.env.DB_USERNAME || 'postgres',
    extra: {
      ssl: process.env.IS_PROD,
    },
  });
}