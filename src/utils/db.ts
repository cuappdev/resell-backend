import { Connection, createConnection } from 'typeorm';
import User from '../models/UserModel';

export default async function resellConnection(): Promise<Connection> {
  return await createConnection({
    database: 'resell',
    entities: [User],
    logging: false, //set to true to help with debugging
    password: process.env.DB_PASSWORD || 'postgres',
    synchronize: true,
    type: 'postgres',
    username: process.env.DB_USERNAME || 'postgres',
  });
}