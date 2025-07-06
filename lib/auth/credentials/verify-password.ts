import "server-only";

import { verify } from "@node-rs/argon2";
import { Effect, Data, Option, pipe } from "effect";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

/************************************************
 *
 * Verify user password
 *
 ************************************************/

class PasswordverificationError extends Data.TaggedError(
  "PasswordVerificationError"
)<{ operation: string; cause: unknown }> {}

class InvalidPasswordError extends Data.TaggedError("InvalidPasswordError")<{
  operation: string;
  message: string;
}> {}

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  operation: string;
  cause: unknown;
}> {}

class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
  operation: string;
  cause: unknown;
}> {}

class PasswordNotSetError extends Data.TaggedError("PasswordNotSetError")<{
  operation: string;
  cause: unknown;
}> {}

export function verifyPassword(email: string, password: string) {
  return Effect.gen(function* () {
    const result = yield* Effect.tryPromise({
      try: async () => {
        const result = await db
          .select({ password: usersTable.password })
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        return result;
      },
      catch: (error) =>
        new DatabaseError({
          operation: "verifyPassword",
          cause: error,
        }),
    });

    const user = yield* pipe(
      Option.fromNullable(result[0]),
      Effect.mapError(
        (error) =>
          new UserNotFoundError({
            operation: "verifyPassword",
            cause: error,
          })
      )
    );

    const hashedPassword = yield* pipe(
      Option.fromNullable(user.password),
      Effect.mapError(
        (error) =>
          new PasswordNotSetError({ operation: "verifyPassword", cause: error })
      )
    );

    // Verify the password using argon2
    const isValid = yield* Effect.tryPromise({
      try: async () => verify(hashedPassword, password),
      catch: (error) =>
        new PasswordverificationError({
          operation: "verifyPassword",
          cause: error,
        }),
    });

    if (!isValid) {
      yield* new InvalidPasswordError({
        operation: "verifyPassword",
        message: "Invalid email or password.",
      });
    }

    // Success - password is valid, return void
  }).pipe(
    Effect.tapErrorTag("PasswordVerificationError", (error) =>
      Effect.logError(error)
    ),
    Effect.tapErrorTag("InvalidPasswordError", (error) =>
      Effect.logError(error)
    ),
    Effect.tapErrorTag("DatabaseError", (error) => Effect.logError(error)),
    Effect.tapErrorTag("UserNotFoundError", (error) => Effect.logError(error)),
    Effect.tapErrorTag("PasswordNotSetError", (error) => Effect.logError(error))
  );
}
