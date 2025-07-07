import "server-only";

import { Effect, Data } from "effect";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  operation: string;
  cause: unknown;
}> {}

export function changePassword(email: string, hashedPassword: string) {
  return Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: () =>
        db
          .update(usersTable)
          .set({ password: hashedPassword })
          .where(eq(usersTable.email, email)),
      catch: (error) =>
        new DatabaseError({
          operation: "updatePassword",
          cause: error,
        }),
    });
  }).pipe(
    Effect.tapErrorTag("DatabaseError", (error) => Effect.logError(error))
  );
}
