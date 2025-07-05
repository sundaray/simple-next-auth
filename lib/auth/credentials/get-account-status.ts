import "server-only";

import { Effect, Console, Data } from "effect";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

/************************************************
 *
 * Check if an account exists with a verified email
 *
 ************************************************/

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  operation: string;
  cause: unknown;
}> {}

type AccountStatus =
  | { _tag: "NoAccount" }
  | { _tag: "UnverifiedAccount" }
  | { _tag: "VerifiedAccount" };

export function getAccountStatus(
  email: string
): Effect.Effect<AccountStatus, DatabaseError, never> {
  return Effect.gen(function* () {
    const users = yield* Effect.tryPromise({
      try: async () => {
        const users = await db
          .select({
            credentialEmailVerified: usersTable.credentialEmailVerified,
          })
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        return users;
      },
      catch: (error) =>
        new DatabaseError({
          operation: "doesAccountExist",
          cause: error,
        }),
    });

    if (users.length === 0) {
      return { _tag: "NoAccount" as const };
    }

    if (!users[0].credentialEmailVerified) {
      return { _tag: "UnverifiedAccount" as const };
    }

    return { _tag: "VerifiedAccount" as const };
  }).pipe(Effect.tapErrorTag("DatabaseError", (error) => Console.error(error)));
}
