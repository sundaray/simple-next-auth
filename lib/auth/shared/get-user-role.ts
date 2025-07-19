import "server-only";

import { Effect, Data } from "effect";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DatabaseService } from "@/lib/services/database-service";

/************************************************
 *
 * Get user role
 *
 ************************************************/

class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
  operation: string;
}> {}

export function getUserRole(email: string) {
  return Effect.gen(function* () {
    const dbService = yield* DatabaseService;
    const result = yield* dbService.use((db) =>
      db
        .select({ role: usersTable.role })
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1)
    );

    if (result.length === 0) {
      yield* Effect.fail(new UserNotFoundError({ operation: "getUserRole" }));
    }

    return result[0].role;
  }).pipe(
    Effect.tapErrorTag("DatabaseError", (error) =>
      Effect.logError({ error, operation: "getUserRole" })
    ),
    Effect.tapErrorTag("UserNotFoundError", (error) => Effect.logError(error))
  );
}
