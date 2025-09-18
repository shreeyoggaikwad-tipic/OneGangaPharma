import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in your .env file for local PostgreSQL connection");
}

export default defineConfig({
  schema: "./shared/schema.ts",
  dialect: "mysql",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
