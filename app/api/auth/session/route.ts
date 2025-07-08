import { NextResponse } from "next/server";
import { Effect, Option } from "effect";
import { getUserSession } from "@/lib/auth/session/get-user-session";
import { UserSession } from "@/lib/schema";

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export async function GET() {
  const program = Effect.gen(function* () {
    const sessionOption = yield* getUserSession();

    return Option.match(sessionOption, {
      onNone: () =>
        NextResponse.json(
          {
            success: false,
            error: {
              code: "USER_SESSION_NOT_FOUND",
              message: "No user session found.",
            },
          } satisfies ApiResponse<never>,
          { status: 401 }
        ),
      onSome: (session) =>
        NextResponse.json(
          {
            success: true,
            data: session,
          } satisfies ApiResponse<UserSession>,
          { status: 200 }
        ),
    });
  });

  const handledProgram = program.pipe(
    Effect.catchTag("CookieStoreAccessError", (error) =>
      Effect.gen(function* () {
        yield* Effect.logError("Failed to access cookie store", error);

        // Step 2: Create and return the 500 response
        const response: ApiResponse<never> = {
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message:
              "A server error occurred while accessing the user session.",
          },
        };
        return NextResponse.json(response, { status: 500 });
      })
    )
  );

  return Effect.runPromise(handledProgram);
}
