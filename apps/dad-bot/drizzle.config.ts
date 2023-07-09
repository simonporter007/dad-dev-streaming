import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();
 
export default {
  schema: "./src/db/*",
  out: "./migrations",
  breakpoints: false,
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DB_NAME || 'data.db',
  }
} satisfies Config;
