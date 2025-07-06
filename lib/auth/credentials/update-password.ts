import "server-only";

import { Effect, Data } from "effect";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

class PasswordUpdateError extends Data.TaggedError("PasswordUpdateError")<{
  operation: string;
  cause: unknown;
}> {}

export function updatePassword(email: string, hashedPassword: string) {
  return Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: () =>
        db
          .update(usersTable)
          .set({ password: hashedPassword })
          .where(eq(usersTable.email, email)),
      catch: (error) =>
        new PasswordUpdateError({
          operation: "updatePassword",
          cause: error,
        }),
    });
  }).pipe(
    Effect.tapErrorTag("PasswordUpdateError", (error) => Effect.logError(error))
  );
}
