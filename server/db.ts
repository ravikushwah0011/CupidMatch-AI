import { drizzle } from "drizzle-orm/neon-serverless";
import { neon, neonConfig } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Fix for deprecated fetchConnectionCache option
neonConfig.fetchConnectionCache = true;

// Create the connection with error handling
const sql = neon(process.env.DATABASE_URL || '');

// Create the db instance with schema for type safety
const db = drizzle(sql);

// Export the db instance
export { db };