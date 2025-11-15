import { Connection, createConnection } from 'typeorm';
// import { models } from '../models';

export default async function resellConnection(): Promise<Connection> {
  return await createConnection({
    database: process.env.DB_NAME || 'resell-test',
    entities: [__dirname + '/../models/*.ts'],
    host: process.env.DB_HOST,
    logging: (process.env.LOGGING?.toLowerCase() === "true"), //set to true to help with debugging
    password: process.env.DB_PASSWORD,
    port: +(process.env.DB_PORT || 5432),
    synchronize: true,
    type: 'postgres',
    username: process.env.DB_USERNAME || 'postgres',
    extra: {
      ssl: (process.env.IS_PROD?.toLowerCase() === "true"),
    },
    migrations: [
      'src/migrations/*.ts',
    ],
    cli: {
      entitiesDir: 'src/models/',
      migrationsDir: 'src/migrations',
    },
  });
}
