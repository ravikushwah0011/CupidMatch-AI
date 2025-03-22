import { drizzle } from "drizzle-orm/neon-serverless";
import { neon, neonConfig } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Fix for deprecated fetchConnectionCache option
neonConfig.fetchConnectionCache = true;

// Create the connection with error handling - ensure we have a valid DATABASE_URL
const connectionString = process.env.DATABASE_URL || '';
const sql = neon(connectionString);

// Create the db instance with schema for type safety
// Pass schema explicitly to get proper type inference
export const db = drizzle(sql, { schema });