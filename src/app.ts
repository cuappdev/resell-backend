// Load environment and Firebase configuration first
import "dotenv/config";
import "./firebase";
import "reflect-metadata";

import {
  createExpressServer,
  useContainer as routingUseContainer,
} from "routing-controllers";
import { getManager, useContainer } from "typeorm";
import { Container } from "typeorm-typedi-extensions";
import { Express, Request, Response } from "express";
import * as swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

import { controllers } from './api/controllers';
import { middlewares } from './api/middlewares';
import { UserModel } from './models/UserModel';
import { ReportController } from './api/controllers/ReportController';
import resellConnection from './utils/DB';
import { ReportService } from './services/ReportService';
import { reportToString } from './utils/Requests';
import { startTransactionConfirmationCron } from './cron/transactionCron';

dotenv.config();

const port = process.env.PORT ?? 3000;
const app: Express = createExpressServer({
  cors: true,
  routePrefix: "/api/",
  controllers: controllers,
  middlewares: middlewares,
  defaults: {
    paramOptions: {
      required: true, // Make all params required by default
    },
  },
  validation: true,
  development: process.env.NODE_ENV !== "production",
  defaultErrorHandler: false,
  currentUserChecker: FirebaseCurrentUserChecker,
});

/**
 * Setup Swagger docs
 */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
console.log(
  `Swagger documentation available at http://localhost:${port}/api-docs`,
);

/**
 * Health check endpoint
 */
app.get("/health", async (_req: Request, res: Response) => {
  const manager = getManager();
  try {
    await manager.query("SELECT 1");
    res.status(200).json({ status: "healthy", database: "Connected" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Error", database: "Not connected", error: error });
  }
});

// Setup dependency injection containers
routingUseContainer(Container);
useContainer(Container);

// Initialize and start application
async function main() {
  // Initialize database connection
  await resellConnection().catch((error: unknown) => {
    console.log(error);
    throw new Error("Connection to DB failed. Check console output");
  });

  // Start server
  app.listen(port, () => {
    // Start cron jobs after server is running
    console.log(`Resell backend bartering on http://localhost:${port}`);

    startTransactionConfirmationCron();
  });
}

main();
