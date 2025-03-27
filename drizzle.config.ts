import { defineConfig } from "drizzle-kit";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  driver: "pglite",  // ✅ Use "pglite" for local PostgreSQL
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
