import 'dotenv/config';
// import { drizzle } from "drizzle-orm/neon-http";
import { drizzle } from "drizzle-orm/node-postgres"; // ✅ Use node-postgres for local connection
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";
import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// const sql = neon(connectionString);

// ✅ Use PostgreSQL pool for local connection
const sql = new Pool({
  connectionString,
});

export const db = drizzle(sql, { schema });
