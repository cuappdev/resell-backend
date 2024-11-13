// necessary immediate imports
import 'reflect-metadata';

import dotenv from 'dotenv';
import { createExpressServer, ForbiddenError, useContainer as routingUseContainer } from 'routing-controllers';
import { EntityManager, getManager, useContainer } from 'typeorm';
import { Container } from 'typeorm-typedi-extensions';

import express from 'express';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import swaggerUi from 'swagger-ui-express';

import { controllers } from './api/controllers';
import { middlewares } from './api/middlewares';
import { UserModel } from './models/UserModel';
import { UserSessionModel } from './models/UserSessionModel';
import { ReportPostRequest, ReportProfileRequest, ReportMessageRequest } from './types';
import { GetReportsResponse, Report } from './types/ApiResponses';
import { ReportController } from './api/controllers/ReportController';
import resellConnection from './utils/DB';
import { ReportService } from './services/ReportService';
import { ReportRepository } from './repositories/ReportRepository';
import { reportToString } from './utils/Requests';
import { CurrentUserChecker } from 'routing-controllers/types/CurrentUserChecker';

dotenv.config();


async function main() {
  routingUseContainer(Container);
  useContainer(Container);

  await resellConnection().catch((error: any) => {
    console.log(error);
    throw new Error("Connection to DB failed. Check console output");
  });

  const app = createExpressServer({
    cors: true,
    routePrefix: '/api/',
    controllers: controllers,
    middlewares: middlewares,
    currentUserChecker: async (action: any) => {
      // BYPASS: Return a mock user for development
      return {
        id: "33242381-1bbb-4a3b-be3a-5a2f8e9349e8",
        username: "test",
        netid: "test123",
        givenName: "test",
        familyName: "test",
        photoUrl: "https://img1.png",
        email: "test123@cornell.edu",
        googleId: "414b5b2d-3351-49ce-95fe-b98a1fe8ceae",
        bio: "test user",
        isActive: true,
        admin: false,
        // Add any other required user properties here
        posts: [],
        saved: [],
        sessions: [],
        feedbacks: [],
        requests: []
      };
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

  const routingControllersOptions = {
    cors: true,
    routePrefix: '/api/',
    controllers: controllers,
    middlewares: middlewares,
    currentUserChecker: async (action: any) => {
      // BYPASS: Return a mock user for development
      return {
        id: "33242381-1bbb-4a3b-be3a-5a2f8e9349e8",
        username: "test",
        netid: "test123",
        givenName: "test",
        familyName: "test",
        photoUrl: "https://img1.png",
        email: "test123@cornell.edu",
        googleId: "414b5b2d-3351-49ce-95fe-b98a1fe8ceae",
        bio: "test user",
        isActive: true,
        admin: false,
        // Add any other required user properties here
        posts: [],
        saved: [],
        sessions: [],
        feedbacks: [],
        requests: []
      };
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
  };

  const entityManager = getManager();
  const reportService = new ReportService(entityManager);
  const reportController = new ReportController(reportService);
  const routingApp = createExpressServer(routingControllersOptions);

  const schemas = validationMetadatasToSchemas({
    refPointerPrefix: '#/components/schemas/'
  });

  const storage = getMetadataArgsStorage();
  const spec = routingControllersToSpec(
    storage,
    routingControllersOptions,
    {
      components: {
        schemas: schemas as any,
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      info: {
        title: 'Resell API',
        version: '1.0.0',
        description: 'API documentation for the Resell backend service'
      },
      security: [{ bearerAuth: [] }]
    }
  );

  app.use(routingApp);

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

  app.set('view engine', 'pug')

  app.get('/api/reports/admin/', async (req: any, res: any) => {
    const userCheck = async (action: any) => {
      const accessToken = action.headers["authorization"];
      const manager = getManager();
      const session = await manager.findOne(UserSessionModel, { accessToken: accessToken });
      if (session && session.expiresAt.getTime() > Date.now()) {
        const userId = session.userId;
        const user = await manager.findOne(UserModel, { id: userId }, { relations: ["posts", "saved", "sessions", "feedbacks", "requests"] });
        if (!user || !user.admin) throw new ForbiddenError("User unauthorized");
        return user;
      }
      throw new ForbiddenError("User unauthorized");
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
  
  const host = process.env.HOST ?? 'localhost';
  const port = +(process.env.PORT ?? 3000);

  app.listen(port, () => {
    console.log(`Resell backend bartering on ${host}:${port}`);
    console.log(`Swagger documentation available at http://${host}:${port}/docs`);
  });
}

main();