import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import routers from './routers/Routers';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_, res) => {
  res.send('Nothing to see here');
});

app.use(routers);

const server = app.listen(port, () => {
  console.log('Listening on localhost:3000');
});