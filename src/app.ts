// Necessary immediate imports
import dotenv from 'dotenv';
dotenv.config();
import "reflect-metadata";


import { createExpressServer, useContainer as routingUseContainer } from 'routing-controllers';
import { useContainer } from 'typeorm';
import { Container } from 'typeorm-typedi-extensions';
import { controllers } from './api/controllers';
import resellConnection from './utils/db';

async function main() {
  routingUseContainer(Container);
  useContainer(Container);

  await resellConnection().catch(e => {
    throw Error(JSON.stringify({ message: "Could not connect to DB.", error: e }));
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

  app.listen(port, () => {
    console.log(`Resell backend bartering 🛍  on localhost:${port}`);
  });
}

main();