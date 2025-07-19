import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { PgClient } from "@effect/sql-pg";
import { Config, Effect } from "effect";
import * as schema from "@/db/schema";

// Create the SQL client layer
const SqlLive = PgClient.layerConfig({
  url: Config.redacted("DATABASE_URL"),
});

export class DatabaseService extends Effect.Service<DatabaseService>()(
  "DatabaseService",
  {
    effect: Effect.gen(function* () {
      const db = yield* PgDrizzle.make({
        schema: schema,
      });

      return { db };
    }),
    dependencies: [SqlLive],
  }
) {}
