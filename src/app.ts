//Necessary immediate imports
import dotenv from 'dotenv';
dotenv.config();
import "reflect-metadata";

import express from 'express';

import resellConnection from './utils/db';
import routers from './routers/Routers';

async function main() {
  const conn = await resellConnection().catch(e => {
    throw Error(JSON.stringify({ message: "Could not connect to DB.", error: e }));
  });

  const app = express();
  const port = process.env.PORT || 3000;

  app.get('/', (_, res) => {
    res.send('Nothing to see here');
  });

  app.use(routers);

  const server = app.listen(port, () => {
    console.log('Listening on localhost:3000');
  });
}

main();