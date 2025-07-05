import { Effect, Data } from "effect";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import type { User, InsertUser } from "@/db/schema";
import { eq } from "drizzle-orm";

/************************************************
 * Error Types
 ************************************************/

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  operation: string;
  cause: unknown;
}> {}

function findUserByEmail(email: string) {
  return Effect.tryPromise({
    try: async () => {
      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      return users[0] || null;
    },
    catch: (error) =>
      new DatabaseError({
        operation: "findUserByEmail",
        cause: error,
      }),
  });
}

function linkProvider(
  userId: string,
  provider: "google" | "credentials",
  currentProviders: string[],
  picture?: string,
  password?: string
) {
  return Effect.tryPromise({
    try: async () => {
      let providerUpdates = {};

      if (provider === "google" && picture) {
        providerUpdates = { picture };
      } else if (provider === "credentials" && password) {
        providerUpdates = {
          password,
          credentialEmailVerified: true,
        };
      }

      const [updatedUser] = await db
        .update(usersTable)
        .set({
          authProviders: [...currentProviders, provider],
          ...providerUpdates,
        })
        .where(eq(usersTable.id, userId))
        .returning();

      return updatedUser;
    },
    catch: (error) =>
      new DatabaseError({
        operation: "linkProvider",
        cause: error,
      }),
  });
}

export function findUserByEmailAndProvider(
  email: string,
  provider: "google" | "credentials"
) {
  return Effect.gen(function* () {
    const user = yield* findUserByEmail(email);

    if (!user) {
      return { user: null, isProviderLinked: false };
    }

    const isProviderLinked = user.authProviders?.includes(provider) || false;
    return { user, isProviderLinked };
  });
}

export function createUser(
  email: string,
  role: string,
  provider: "google" | "credentials",
  picture?: string,
  password?: string
) {
  return Effect.gen(function* () {
    // Check if user exists and has this provider
    const { user: existingUser, isProviderLinked } =
      yield* findUserByEmailAndProvider(email, provider);

    // User exists and already has this provider - nothing to do
    if (existingUser && isProviderLinked) {
      return existingUser;
    }

    // User exists but doesn't have this provider - link it
    if (existingUser && !isProviderLinked) {
      return yield* linkProvider(
        existingUser.id,
        provider,
        existingUser.authProviders || [],
        picture,
        password
      );
    }

    // User doesn't exist - create new user
    let providerFields: Partial<InsertUser> = {};

    if (provider === "google" && picture) {
      providerFields = { picture };
    } else if (provider === "credentials" && password) {
      providerFields = {
        password,
        credentialEmailVerified: true,
      };
    }

    const newUserData: InsertUser = {
      email,
      role,
      authProviders: [provider],
      ...providerFields,
    };

    const [newUser] = yield* Effect.tryPromise({
      try: async () => {
        return await db.insert(usersTable).values(newUserData).returning();
      },
      catch: (error) =>
        new DatabaseError({
          operation: "createUser",
          cause: error,
        }),
    });

    return newUser;
  });
}
