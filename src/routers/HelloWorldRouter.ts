import { Request, Response, Router } from "express";

const route = "/hello";
const helloRouter = Router();

async function helloHandler(_: Request, res: Response) {
  res.send("Hello World!");
}

helloRouter.get(route, helloHandler);

export default helloRouter;