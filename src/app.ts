// Necessary immediate imports
import 'reflect-metadata';

import dotenv from 'dotenv';
import { createExpressServer, useContainer as routingUseContainer } from 'routing-controllers';
import { useContainer } from 'typeorm';
import { Container } from 'typeorm-typedi-extensions';

import { controllers } from './api/controllers';
import resellConnection from './utils/db';

dotenv.config();

async function main() {
  routingUseContainer(Container);
  useContainer(Container);

  await resellConnection().catch((error: any) => {
    console.log(error);
  });

  const app = createExpressServer({
    cors: true,
    routePrefix: '/api/',
    controllers: controllers,
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
  
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || 'localhost';

  app.listen(port, () => {
    console.log(`Resell backend bartering 🛍  on ${host}:${port}`);
  });
}

main();