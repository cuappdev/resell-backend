import { Connection, createConnection } from 'typeorm';
import User from '../models/UserModel';
import Post from '../models/PostModel';
import Image from '../models/ImageModel';

export default async function resellConnection(): Promise<Connection> {
  return await createConnection({
    database: 'resell',
    entities: [User, Post, Image],
    logging: false, //set to true to help with debugging
    password: process.env.DB_PASSWORD || 'postgres',
    synchronize: true,
    type: 'postgres',
    username: process.env.DB_USERNAME || 'postgres',
  });
}