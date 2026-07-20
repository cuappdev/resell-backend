import { NextFunction, Request, Response } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";

/**
 * Logs method, path, status, and duration for every API request.
 * Flag slow calls (>= SLOW_MS) so similarity/pagination regressions stand out.
 */
@Middleware({ type: "before" })
export class RequestTimingMiddleware implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction): void {
    const started = Date.now();
    const slowMs = Number(process.env.SLOW_REQUEST_MS ?? 500);

    response.on("finish", () => {
      const ms = Date.now() - started;
      const line = `${request.method} ${request.originalUrl} → ${response.statusCode} ${ms}ms`;
      if (ms >= slowMs) {
        console.warn(`[SLOW] ${line}`);
      } else {
        console.log(`[REQ] ${line}`);
      }
    });

    next();
  }
}
