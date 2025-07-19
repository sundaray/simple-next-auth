import { Effect, Config, Redacted } from "effect";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = Config.redacted("DATABASE_URL");

const connectionString = Redacted.value(Effect.runSync(databaseUrl));

// For Next.js edge runtime compatibility
const client = postgres(connectionString, {
  prepare: false,
  max: 5, // Connection pool size
});

export const db = drizzle(client);
