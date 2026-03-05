import { Connection, createConnection } from "typeorm";

export default async function resellConnection(): Promise<Connection> {
  const entitiesPath = __dirname + "/../models/*Model.ts";
  return await createConnection({
    database: process.env.DB_NAME || "resell-test",
    entities: [entitiesPath],
    host: process.env.DB_HOST,
    logging: true,
    password: process.env.DB_PASSWORD,
    port: +(process.env.DB_PORT || 5432),
    synchronize: false,
    type: "postgres",
    username: process.env.DB_USERNAME || "postgres",
    extra: {
      ssl: process.env.IS_PROD?.toLowerCase() === "true",
    },
    migrations: ["src/migrations/*.ts"],
    cli: {
      entitiesDir: "src/models/",
      migrationsDir: "src/migrations",
    },
  });
}
