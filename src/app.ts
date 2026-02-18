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

  const app: Express = createExpressServer({
    cors: true,
    routePrefix: "/api/",
    controllers: controllers,
    middlewares: middlewares,
    currentUserChecker: async (action: any) => {
      const authHeader = action.request.headers["authorization"];
      if (!authHeader) {
        throw new ForbiddenError("No authorization token provided");
      }
      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new ForbiddenError("Invalid authorization token format");
      }
      try {
        // Verify the token using Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(token);
        // Check if the email is a Cornell email
        const email = decodedToken.email;
        const userId = decodedToken.uid;
        action.request.email = email;
        action.request.firebaseUid = userId;
        if (!email || !email.endsWith("@cornell.edu")) {
          throw new ForbiddenError("Only Cornell email addresses are allowed");
        }
        // Find or create user in your database using Firebase UID
        const manager = getManager();
        const user = await manager.findOne(
          UserModel,
          { firebaseUid: userId },
          { relations: ["posts", "saved", "feedbacks", "requests"] },
        );
        if (!user) {
          // Check if this is the user creation route or authorization route
          const isUserCreateRoute =
            action.request.path === "/api/user/create/" ||
            action.request.path === "/api/user/create" ||
            action.request.path === "/api/authorize" ||
            action.request.path === "api/authorize";
          console.log(
            `User not found for path: ${action.request.path}, isUserCreateRoute: ${isUserCreateRoute}`,
          );
          if (!isUserCreateRoute) {
            throw new ForbiddenError(
              "User not found. Please create an account first.",
            );
          }
          // For user creation routes, return a minimal UserModel
          const tempUser = new UserModel();
          tempUser.googleId = email;
          tempUser.firebaseUid = decodedToken.uid;
          tempUser.email = email;
          tempUser.username = `temp_${decodedToken.uid}`;
          tempUser.isActive = true;
          tempUser.admin = false;
          tempUser.isNewUser = true;
          return tempUser;
        }
        if (!user) {
          throw new ForbiddenError("User authentication failed");
        }
        return user;
      } catch (error) {
        if (error instanceof ForbiddenError) {
          throw error;
        }
        if (error.code == "auth/argument-error") {
          throw new HttpError(
            408,
            "Request timed out while waiting for response",
          );
        }
        if (error.code === "auth/id-token-expired") {
          throw new UnauthorizedError("Token has expired");
        }
        throw new UnauthorizedError("Invalid authorization token");
      }
    },
    defaults: {
      paramOptions: {
        required: true,
      },
    },
    validation: {
      whitelist: true,
      skipMissingProperties: true,
      forbidUnknownValues: true,
    },
    defaultErrorHandler: false,
  });

  const port = process.env.PORT ?? 3000;

  const swaggerDocument = require(path.join(__dirname, "../swagger.json"));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log(
    `Swagger documentation available at http://localhost:${port}/api-docs`,
  );

  const entityManager = getManager();
  const reportService = new ReportService(entityManager);
  const reportController = new ReportController(reportService);

  app.get("/api/reports/admin/", async (req: any, res: any) => {
    const userCheck = async (action: any) => {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        throw new ForbiddenError("No authorization token provided");
      }
      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new ForbiddenError("Invalid authorization token format");
      }

      try {
        const userId = action.request.firebaseUid;
        // Find or create user in your database using Firebase UID
        const manager = getManager();
        const user = await manager.findOne(UserModel, { firebaseUid: userId });
        if (!user || !user.admin) throw new ForbiddenError("User unauthorized");
        return user;
      } catch (error) {
        if (error.code === "auth/id-token-expired") {
          throw new UnauthorizedError("Token has expired");
        }
        throw new UnauthorizedError("Invalid authorization token");
      }
    };
    const user = await userCheck(req);
    user.admin = true;
    const postReports = await reportController.getAllPostReports(user);
    const profileReports = await reportController.getAllProfileReports(user);
    const messageReports = await reportController.getAllMessageReports(user);
    res.render("admin", {
      postReports: reportToString(postReports),
      profileReports: reportToString(profileReports),
      messageReports: reportToString(messageReports),
    });
  });

  app.listen(port, () => {
    // Start cron jobs after server is running
    console.log(`Resell backend bartering on http://localhost:${port}`);

    startTransactionConfirmationCron();
  });
}

main();
