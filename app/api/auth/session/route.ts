import { NextResponse } from "next/server";
import { Effect } from "effect";
import { getUserSession } from "@/lib/auth/session/get-user-session";

/************************************************
 *
 * Route Handler
 *
 ************************************************/

// Define a standard API response type
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export async function GET() {
  const program = Effect.gen(function* () {
    const user = yield* getUserSession();
    return user;
  });

  const handledProgram = program.pipe(
    Effect.tapErrorCause((cause) =>
      Effect.logError({
        operation: "GET app/api/auth/session",
        cause: cause,
      })
    ),
    Effect.matchEffect({
      onFailure: (error) => {
        // All errors mean session not found from the client's perspective
        const response: ApiResponse<never> = {
          success: false,
          error: {
            code: "SESSION_NOT_FOUND",
            message: "User session not found",
          },
        };

        return Effect.succeed(NextResponse.json(response, { status: 404 }));
      },
      onSuccess: (user) => {
        const response: ApiResponse<typeof user> = {
          success: true,
          data: user,
        };
        return Effect.succeed(NextResponse.json(response));
      },
    })
  );

  return Effect.runPromise(handledProgram);
}
