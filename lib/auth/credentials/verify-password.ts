import "server-only";

import { verify } from "@node-rs/argon2";
import { Effect, Data, Console } from "effect";

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

    // We know the user exists and has a password because
    // doesAccountExist already verified credentialEmailVerified
    const hashedPassword = result[0]!.password!;

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
      Console.error("Password verification error: ", error)
    ),
    Effect.tapErrorTag("InvalidPasswordError", (error) =>
      Console.error("Invalid password error: ", error)
    ),
    Effect.tapErrorTag("DatabaseError", (error) =>
      Console.error("Database error: ", error)
    )
  );
}
