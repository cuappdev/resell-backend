import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "routing-controllers";

/** Development helpers must never mint tokens for remote callers. */
export function localAuthOnly(req: Request, _res: Response, next: NextFunction): void {
  const address = req.socket.remoteAddress;
  const loopback = address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
  const origin = req.headers.origin;
  const localOrigins = ["localhost", "127.0.0.1", "[::1]"].map(
    host => new URL(`http://${host}:${req.socket.localPort || 80}`).origin,
  );
  const allowedOrigin = !origin || (
    localOrigins.includes(origin) && origin === `http://${req.headers.host}`
  );
  if (
    process.env.ENABLE_LOCAL_AUTH !== "true" ||
    process.env.NODE_ENV !== "development" ||
    process.env.IS_PROD === "true" ||
    process.env.VERCEL ||
    !loopback ||
    req.headers["x-forwarded-for"] ||
    req.headers["forwarded"] ||
    !allowedOrigin
  ) {
    throw new NotFoundError(
      "Local auth is disabled or this request is not allowed. Start with npm run dev:auth, keep IS_PROD unset/false, and use Swagger on the same localhost server without a proxy. This helper is unavailable on Vercel.",
    );
  }
  next();
}
