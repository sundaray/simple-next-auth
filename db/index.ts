import { Effect, Config, Redacted } from "effect";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// 1. Describe the configuration you need.
// We use Config.redacted because the URL contains a password.
const databaseUrl = Config.redacted("DATABASE_URL");

// 2. Run the Effect program to load the configuration.
// Effect.runSync will execute the effect and either return the value
// or throw a descriptive error if the config is missing.
const dbUrlRedacted = Effect.runSync(databaseUrl);

// 3. Get the raw string value from the secure Redacted wrapper.
const connectionString = Redacted.value(dbUrlRedacted);

// For Next.js edge runtime compatibility
const client = postgres(connectionString, {
  prepare: false,
  max: 5, // Connection pool size
});

export const db = drizzle(client);
