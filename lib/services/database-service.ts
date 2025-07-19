import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { PgClient } from "@effect/sql-pg";
import { Config, Effect, Data } from "effect";
import * as schema from "@/db/schema";
import type { PgRemoteDatabase } from "drizzle-orm/pg-proxy";

// Create the SQL client layer
const SqlLive = PgClient.layerConfig({
  url: Config.redacted("DATABASE_URL"),
});

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  cause: unknown;
}> {}

type DatabaseServiceImp = {
  use: <A>(
    f: (db: PgRemoteDatabase<typeof schema>) => Promise<A>
  ) => Effect.Effect<A, DatabaseError>;
};

export class DatabaseService extends Effect.Service<DatabaseService>()(
  "DatabaseService",
  {
    effect: Effect.gen(function* () {
      const db = yield* PgDrizzle.make({
        schema: schema,
      });
      return {
        use: (f) =>
          Effect.tryPromise({
            try: () => f(db),
            catch: (error) => new DatabaseError({ cause: error }),
          }),
      } satisfies DatabaseServiceImp;
    }),
    dependencies: [SqlLive],
  }
) {}
