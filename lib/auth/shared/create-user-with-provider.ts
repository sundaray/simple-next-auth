import { Effect, Data, Option } from "effect";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import type { InsertUser } from "@/db/schema";
import { eq } from "drizzle-orm";

/************************************************
 * Error Types
 ************************************************/

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  operation: string;
  cause: unknown;
}> {}

function createUser(
  email: string,
  role: "admin" | "regular",
  provider: "google" | "credentials",
  picture?: string,
  password?: string
) {
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

  return Effect.tryPromise({
    try: async () => {
      const users = await db.insert(usersTable).values(newUserData).returning();
      // Drizzle's .returning() always gives an array, even for a single insert.
      // We extract the single user object from the array here.
      return users[0];
    },
    catch: (error) =>
      new DatabaseError({
        operation: "_createUserRecord",
        cause: error,
      }),
  });
}

function linkProvider(
  userId: string,
  provider: "google" | "credentials",
  currentProviders: ("google" | "credentials")[],
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

function doesUserWithProviderExist(
  email: string,
  provider: "google" | "credentials"
) {
  return Effect.gen(function* () {
    // Step 1: Get the user from the database.
    // The result of this is an `Option<User>`.
    const userOption = yield* Effect.tryPromise({
      try: async () => {
        const users = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        return Option.fromNullable(users[0]);
      },
      catch: (error) =>
        new DatabaseError({
          operation: "findUserByEmailAndProvider",
          cause: error,
        }),
    });

    // Step 2: Check if a user was actually found.
    if (Option.isNone(userOption)) {
      // If no user was found, the final result of this entire Effect
      // will be `Option.none()`.
      return Option.none();
    }

    // Step 3: Since we passed the `if` check, we know a user exists.
    const user = userOption.value;

    // Step 4: Determine if the provider is linked.
    // This reads as: "Does user.authProviders exist? If so, does it include
    // the provider? If not, the answer is false."
    const isProviderLinked = user.authProviders.includes(provider);

    // Step 5: Construct the final result and wrap it in `Option.some`.
    // This is the successful return value of the entire Effect.
    return Option.some({ user, isProviderLinked });
  });
}

export function createUserWithProvider(
  email: string,
  role: "admin" | "regular",
  provider: "google" | "credentials",
  picture?: string,
  password?: string
) {
  return Effect.gen(function* () {
    // the user's current status. The result will be either:
    //   - `Some<{ user: User, isProviderLinked: boolean }>`
    //   - `None`
    const userStatusOption = yield* doesUserWithProviderExist(email, provider);

    // Stage 2: Check if the Option from the previous step contains a value.
    // This is the "user was found" branch of our logic.
    if (Option.isSome(userStatusOption)) {
      const { user, isProviderLinked } = userStatusOption.value;

      // Stage 2a: If the provider is already linked, our job is done.
      // We return the `user` object, which becomes the success value of the Effect.
      if (isProviderLinked) {
        return user;
      }

      // Stage 2b: The user exists, but this provider is new and needs to be linked.
      const currentProviders = user.authProviders;
      return yield* linkProvider(
        user.id,
        provider,
        currentProviders,
        picture,
        password
      );
    }
    // Stage 3: The `if` condition was false, so we enter the `else` block.
    // This is the "no user was found" branch of our logic.
    else {
      // the final success value of our `createUserWithProvider` Effect.
      return yield* createUser(email, role, provider, picture, password);
    }
  });
}
