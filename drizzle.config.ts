import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Migrations are owned by the storefront repo (fakiha214/norfu).
// This config exists so drizzle-kit tooling (studio, introspection)
// can be used from the admin repo as well.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
