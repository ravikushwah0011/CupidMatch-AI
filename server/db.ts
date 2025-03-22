import { drizzle } from "drizzle-orm/neon-serverless";
import { neon, neonConfig } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// We don't use Node's fetch in serverless mode
neonConfig.fetchConnectionCache = true;

// Create the connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });