import "server-only";

import { Effect, Data } from "effect";
// import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DatabaseService } from "@/lib/services/database-service";

/************************************************
 *
 * Get user role
 *
 ************************************************/

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  operation: string;
  cause: unknown;
}> {}

class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
  operation: string;
}> {}

export function getUserRole(email: string) {
  return Effect.gen(function* () {
    const { db } = yield* DatabaseService;
    const result = yield* Effect.tryPromise({
      try: async () => {
        const result = await db
          .select({ role: usersTable.role })
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        return result;
      },
      catch: (error) =>
        new DatabaseError({
          operation: "getUserRole",
          cause: error,
        }),
    });

    if (result.length === 0) {
      yield* Effect.fail(new UserNotFoundError({ operation: "getUserRole" }));
    }

    return result[0].role;
  }).pipe(
    Effect.tapErrorTag("DatabaseError", (error) => Effect.logError(error)),
    Effect.tapErrorTag("UserNotFoundError", (error) => Effect.logError(error))
  );
}
