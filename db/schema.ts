import {
  boolean,
  pgTable,
  text,
  uuid,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Create an enum for provider types (lowercase values)
export const authProviderEnum = pgEnum("auth_provider", [
  "google",
  "credentials",
]);

// Define the users table
export const usersTable = pgTable("users", {
  // Auto-generating UUID using Drizzle's defaultRandom
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"),
  credentialEmailVerified: boolean("credential_email_verified")
    .notNull()
    .default(false),

  role: text("role").notNull().default("regular"),
  picture: text("picture"),

  // Authentication providers
  authProviders: authProviderEnum("auth_providers")
    .array()
    .notNull()
    .default(sql`'{}'::auth_provider[]`),

  // Creation timestamp with timezone support
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Define types for TypeScript
export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
