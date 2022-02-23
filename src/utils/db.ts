import { Connection, createConnection } from 'typeorm';

import { PostModel } from '../models/PostModel';
import { UserModel } from '../models/UserModel';
import UserSession from '../models/UserSessionModel';

export default async function resellConnection(): Promise<Connection> {
  return await createConnection({
    database: 'resell',
    entities: [UserModel, PostModel, UserSession],
    logging: false, //set to true to help with debugging
    password: process.env.DB_PASSWORD || 'postgres',
    synchronize: true,
    type: 'postgres',
    username: process.env.DB_USERNAME || 'postgres',
  });
}