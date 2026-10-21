import { ErrorHandler } from "./ErrorHandler";
import { RequestTimingMiddleware } from "./RequestTimingMiddleware";

export const middlewares = [RequestTimingMiddleware, ErrorHandler];
