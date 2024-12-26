import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

module.exports = {
   type: 'postgres',
   host: process.env.DB_HOST,
   port: +(process.env.DB_PORT ?? 5432),
   username: process.env.DB_USERNAME || 'postgres',
   password: process.env.DB_PASSWORD || 'postgres',
   database: process.env.DB_NAME,
   entities: [
      'src/models/*.ts',
   ],
   synchronize: false,
   namingStrategy: new SnakeNamingStrategy(),
   migrations: [
      'src/migrations/*.ts',
   ],
   seeds: ['src/seeds/**/*.ts'],
   factories: ['src/factories/**/*.ts'],
   extra: {
      ssl: (process.env.IS_PROD?.toLowerCase() === "true"),
   },
   cli: {
      entitiesDir: 'src/models/',
      migrationsDir: 'src/migrations/',
   },
};