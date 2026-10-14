import dotenv from "dotenv";

// dotenv preserves existing process variables. Load local overrides before defaults.
dotenv.config({ path: ".env.local" });
dotenv.config();
