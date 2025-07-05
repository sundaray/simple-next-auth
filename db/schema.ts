import {
  boolean,
  pgTable,
  text,
  uuid,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

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
  authProviders: authProviderEnum("auth_providers").array(),

  // Subscription flags
  annualAccess: boolean("annual_access").notNull().default(false),
  lifetimeAccess: boolean("lifetime_access").notNull().default(false),

  // Subscription timing fields with timezone support
  annualAccessPurchasedAt: timestamp("annual_access_purchased_at", {
    withTimezone: true,
  }),
  annualAccessExpiresAt: timestamp("annual_access_expires_at", {
    withTimezone: true,
  }),
  lifetimeAccessPurchasedAt: timestamp("lifetime_access_purchased_at", {
    withTimezone: true,
  }),

  // Creation timestamp with timezone support
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Define types for TypeScript
export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

export const subscribersTable = pgTable("subscribers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Define types for TypeScript
export type Subscriber = typeof subscribersTable.$inferSelect;
export type InsertSubscriber = typeof subscribersTable.$inferInsert;
