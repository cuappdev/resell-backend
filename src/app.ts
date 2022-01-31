//Necessary immediate imports
import dotenv from 'dotenv';
dotenv.config();
import "reflect-metadata";

// import alphabetically below VVV
import { controllers } from './controllers';
import { createExpressServer, useContainer as routingUseContainer } from 'routing-controllers';
import express from 'express';

import resellConnection from './utils/db';
import routers from './routers/Routers';

async function main() {
  const conn = await resellConnection().catch(e => {
    throw Error(JSON.stringify({ message: "Could not connect to DB.", error: e }));
  });

  const app = createExpressServer({
    cors: true,
    routePrefix: '/api/',
    controllers: controllers,
    // middlewares: middlewares,
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

  const server = app.listen(port, () => {
    console.log('Listening on localhost:3000');
  });
}

main();