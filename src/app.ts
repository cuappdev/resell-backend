// necessary immediate imports
import 'reflect-metadata';

import dotenv from 'dotenv';
import { createExpressServer, ForbiddenError, useContainer as routingUseContainer } from 'routing-controllers';
import { getManager, useContainer } from 'typeorm';
import { Container } from 'typeorm-typedi-extensions';

import { controllers } from './api/controllers';
import { middlewares } from './api/middlewares';
import { UserModel } from './models/UserModel';
import { UserSessionModel } from './models/UserSessionModel';
import resellConnection from './utils/DB';

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
      const accessToken = action.request.headers["authorization"];
      const manager = getManager();
      // find the user who has a token in their sessions field
      const session = await manager.findOne(UserSessionModel, { accessToken: accessToken });
      // check if the session token has expired
      if (session && session.expiresAt.getTime() > Date.now()) {
        const userId = session.userId;
        // find a user with id `userId` and join with posts, saved,
        // sessions, feedbacks, and requests
        return await manager.findOne(UserModel, { id: userId }, { relations: ["posts", "saved", "sessions", "feedbacks", "requests"] });
      }
      throw new ForbiddenError("User unauthorized");
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
  const port = +(process.env.PORT ?? 3000);

  app.listen(port, () => {
    console.log(`Resell backend bartering on ${host}:${port}`);
  });
}

main();