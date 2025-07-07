  import "server-only";

  import { Effect, Data, Console } from "effect";
  import { db } from "@/db";
  import { usersTable } from "@/db/schema";
  import { eq } from "drizzle-orm";

  /************************************************
   *
   * Get user role
   *
   ************************************************/

  class DatabaseError extends Data.TaggedError("DatabaseError")<{
    operation: string;
    cause: unknown;
  }> {}

  export function getUserRole(email: string) {
    return Effect.gen(function* () {
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

      // We know the user exists because doesAccountExist already verified
      return result[0]!.role;
    }).pipe(
      Effect.tapErrorTag("DatabaseError", (error) =>
        Console.error("Database error: ", error)
      )
    );
  }
