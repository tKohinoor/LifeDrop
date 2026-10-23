import "dotenv/config";
import pg from "pg";

// A pool keeps a few database connections open and shares them between
// requests, which is far faster than reconnecting every time.
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});