import { Router } from "express";
import helloRouter from './HelloWorldRouter';

const routers = Router();

// Register all imported routers to `routers` so that our main app can access them
routers.use(helloRouter);

export default routers;