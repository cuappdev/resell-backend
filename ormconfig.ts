require("dotenv").config();

const url =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || undefined;

const ssl =
  !!url ||
  process.env.IS_PROD?.toLowerCase() === "true" ||
  (url && (url.includes("sslmode=") || url.includes("neon.tech")));

const base = url
  ? {
      type: "postgres",
      url,
    }
  : {
      type: "postgres",
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME,
    };

module.exports = {
  ...base,
  entities: ["src/models/*.ts"],
  synchronize: false,
  migrationsRun: false,
  migrations: ["src/migrations/*.ts"],
  seeds: ["src/seeds/**/*.ts"],
  factories: ["src/factories/**/*.ts"],
  extra: {
    max: Number(process.env.DB_POOL_MAX || 5),
    ssl: ssl ? { rejectUnauthorized: true } : undefined,
  },
  cli: {
    entitiesDir: "src/models/",
    migrationsDir: "src/migrations/",
  },
};
