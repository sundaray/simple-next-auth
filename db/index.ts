import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Create a PostgreSQL client with connection pooling
const connectionString = process.env.DATABASE_URL!;
// For Next.js edge runtime compatibility
const client = postgres(connectionString, {
  prepare: false,
  max: 5, // Connection pool size
});

export const db = drizzle(client);
