import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy proxy — prevents build-time DATABASE_URL errors
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const client = postgres(connectionString, { max: 1 });
    _db = drizzle(client, { schema });
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

// Re-export schema
export * from "./schema";

// Re-export drizzle helpers
export { eq, and, or, desc, asc, sql, count, avg, isNull, isNotNull, gt, lt, gte, lte, ne, inArray, notInArray } from "drizzle-orm";
