// necessary immediate imports
import 'reflect-metadata';

import dotenv from 'dotenv';
import { createExpressServer, useContainer as routingUseContainer } from 'routing-controllers';
import { getManager, useContainer } from 'typeorm';
import { Container } from 'typeorm-typedi-extensions';

import { controllers } from './api/controllers';
import { UserModel } from './models/UserModel';
import { UserSessionModel } from './models/UserSessionModel';
import resellConnection from './utils/db';

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
    currentUserChecker: async (action: any) => {
      const accessToken = action.request.headers["authorization"];
      const manager = getManager();
      // find the user who has a token in their sessions field
      const session = await manager.findOne(UserSessionModel, { accessToken: accessToken });
      if (session) {
        const userId = session.userId;
        return await manager.findOne(UserModel, { id: userId });
      }
      return undefined;
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
  
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Resell backend bartering on ${host}:${port}`);
  });
}

main();