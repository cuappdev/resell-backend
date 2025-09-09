// necessary immediate imports
import 'reflect-metadata';
import 'dotenv/config';


import dotenv from 'dotenv';
import { createExpressServer, ForbiddenError, UnauthorizedError, useContainer as routingUseContainer, HttpError } from 'routing-controllers';

import { EntityManager, getManager, useContainer } from 'typeorm';
import { Container } from 'typeorm-typedi-extensions';
import { Express } from 'express';
import * as swaggerUi from 'swagger-ui-express';
import * as path from 'path';
import * as admin from 'firebase-admin';

dotenv.config();

var serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH!;
const serviceAccount = require(serviceAccountPath);

if (!serviceAccountPath) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set.');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  
  });
}


export { admin };  // Export the admin instance

import { controllers } from './api/controllers';
import { middlewares } from './api/middlewares';
import { UserModel } from './models/UserModel';
import { ReportPostRequest, ReportProfileRequest, ReportMessageRequest } from './types';
import { GetReportsResponse, Report } from './types/ApiResponses';
import { ReportController } from './api/controllers/ReportController';
import resellConnection from './utils/DB';
import { ReportService } from './services/ReportService';
import { ReportRepository } from './repositories/ReportRepository';
import { reportToString } from './utils/Requests';
import { CurrentUserChecker } from 'routing-controllers/types/CurrentUserChecker';
// import { getLoadedModel } from './utils/SentenceEncoder';

dotenv.config();

// TODO: Figure out how to load the model when running app.ts
// export const encoder = await getLoadedModel();

async function main() {
  routingUseContainer(Container);
  useContainer(Container);

  await resellConnection().catch((error: any) => {
    console.log(error);
    throw new Error("Connection to DB failed. Check console output");
  });

  const app: Express = createExpressServer({
    cors: true,
    routePrefix: '/api/',
    controllers: controllers,
    middlewares: middlewares,
    currentUserChecker: async (action: any) => {
      const authHeader = action.request.headers["authorization"];
      if (!authHeader) {
        throw new ForbiddenError("No authorization token provided");
      }
      const token = authHeader.split(' ')[1];
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
        if (!email || !email.endsWith('@cornell.edu')) {
          throw new ForbiddenError('Only Cornell email addresses are allowed');
        }
        // Find or create user in your database using Firebase UID
        const manager = getManager(); 
        let user = await manager.findOne(UserModel, { firebaseUid: userId }, 
          { relations: ["posts", "saved", "feedbacks", "requests"] });
        if (!user) {
          // Check if this is the user creation route or authorization route
          const isUserCreateRoute = action.request.path === '/api/user/create/' || 
                                   action.request.path === '/api/user/create' || 
                                   action.request.path === '/api/authorize' ||
                                   action.request.path === 'api/authorize';
          if (!isUserCreateRoute) {
            throw new ForbiddenError('User not found. Please create an account first.');
          }
          // For user creation routes, return a minimal UserModel
          const tempUser = new UserModel();
          tempUser.googleId = email;
          tempUser.firebaseUid = decodedToken.uid;
          tempUser.isNewUser = true; 
          return tempUser;
        } 
        return user;
      } catch (error) {
        console.log(error); //TODO delete this console.log later
        
        if (error instanceof ForbiddenError) {
          throw error;
        }
        if (error.code == 'auth/argument-error'){
          throw new HttpError(408, 'Request timed out while waiting for response');
        }
        if (error.code === 'auth/id-token-expired') {
          throw new UnauthorizedError('Token has expired');
        }
        throw new UnauthorizedError('Invalid authorization token');
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

  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? 3000;

  const swaggerDocument = require(path.join(__dirname, '../swagger.json'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log(`Swagger documentation available at http://${host}:${port}/api-docs`);
  
  const entityManager = getManager();
  const reportService = new ReportService(entityManager);
  const reportController = new ReportController(reportService);

  app.set('view engine', 'pug')

  app.get('/api/reports/admin/', async (req: any, res: any) => {
    const userCheck = async (action: any) => {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        throw new ForbiddenError("No authorization token provided");
      }
      const token = authHeader.split(' ')[1];
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
        if (error.code === 'auth/id-token-expired') {
          throw new UnauthorizedError('Token has expired');
        }
        throw new UnauthorizedError('Invalid authorization token');
      }
    }
    const user = await userCheck(req);
    user.admin = true;
    const postReports = await reportController.getAllPostReports(user);
    const profileReports = await reportController.getAllProfileReports(user);
    const messageReports = await reportController.getAllMessageReports(user);
    res.render('admin', { 
      postReports: reportToString(postReports), 
      profileReports: reportToString(profileReports), 
      messageReports: reportToString(messageReports) });
  });
  
  app.listen(port, () => {
    console.log(`Resell backend bartering on ${host}:${port}`);
  });
}

main();