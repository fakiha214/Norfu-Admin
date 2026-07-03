import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DB = NeonHttpDatabase<typeof schema>;

let cached: DB | undefined;

function getDb(): DB {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Add it to .env locally or to the Vercel project's environment variables."
      );
    }
    cached = drizzle(neon(url), { schema });
  }
  return cached;
}

// Lazy proxy: the Neon client is only created on first query, so the
// build's module evaluation doesn't require DATABASE_URL to be present.
export const db = new Proxy({} as DB, {
  get(_target, prop) {
    const instance = getDb();
    const value = Reflect.get(instance as object, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
