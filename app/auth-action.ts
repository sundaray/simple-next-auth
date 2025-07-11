"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Effect, Data, pipe } from "effect";

/************************************************
 *
 * Sign out
 *
 ************************************************/

class SignOutError extends Data.TaggedError("SignOutError")<{
  operation: string;
  cause: unknown;
}> {}

export async function signOut() {
  const program = Effect.tryPromise({
    try: async () => {
      const cookieStore = await cookies();
      cookieStore.delete("user-session");
    },
    catch: (error) => new SignOutError({ operation: "signOut", cause: error }),
  });

  const handledProgram = pipe(
    program,
    Effect.map(() => ({ _tag: "Success" as const })),

    Effect.tapErrorTag("SignOutError", (error) => Effect.logError(error)),

    Effect.catchTag("SignOutError", () =>
      Effect.succeed({ _tag: "Error" as const })
    )
  );

  const result = await Effect.runPromise(handledProgram);

  if (result._tag === "Success") {
    redirect("/");
  } else {
    return result;
  }
}
