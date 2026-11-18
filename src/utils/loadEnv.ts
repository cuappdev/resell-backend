import dotenv from "dotenv";

if (
  process.env.NODE_ENV !== "production" &&
  process.env.IS_PROD?.trim().toLowerCase() !== "true" &&
  !process.env.VERCEL &&
  !process.env.VERCEL_ENV
) {
  dotenv.config({ path: ".env.local" });
}
dotenv.config();
