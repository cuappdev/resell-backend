import { Connection, createConnection } from 'typeorm';

import { PostModel } from '../models/PostModel';
import { UserModel } from '../models/UserModel';
import { UserSessionModel } from '../models/UserSessionModel';

const models = [
  UserModel,
  PostModel,
  UserSessionModel
];

export default async function resellConnection(): Promise<Connection> {
  return await createConnection({
    database: process.env.DB_NAME,
    entities: models,
    host: process.env.DB_HOST,
    logging: (process.env.LOGGING?.toLowerCase() === "true"), //set to true to help with debugging
    password: process.env.DB_PASSWORD || 'postgres',
    port: +(process.env.DB_PORT ?? 5432),
    synchronize: true,
    type: 'postgres',
    username: process.env.DB_USERNAME || 'postgres',
    extra: {
      ssl: (process.env.IS_PROD?.toLowerCase() === "true"),
    },
  });
}