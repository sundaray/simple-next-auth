import { NextRequest, NextResponse } from "next/server";
import { Effect, Option, Either } from "effect";
import { extendUserSession } from "@/lib/auth/session/extend-user-session";

/**
 * Updates the user session cookie on GET requests
 * This helps extend session lifetime for active users
 */

export function handleUserSessionExtension(request: NextRequest) {
  return Effect.gen(function* () {
    if (request.method !== "GET") {
      return Option.none();
    }

    const tokenOption = Option.fromNullable(
      request.cookies.get("user-session")?.value
    );

    if (Option.isNone(tokenOption)) {
      return Option.none();
    }

    const token = tokenOption.value;

    // 4. Handle the fallible effect(extendUserSession).
    // `Effect.either` is like a try/catch block for Effect workflows.
    // It runs the effect and wraps the result in an Either:
    // - Right(value) on success
    // - Left(error) on failure
    const result = yield* Effect.either(extendUserSession(token));

    // 5. Pattern match on the result.
    if (Either.isLeft(result)) {
      // This is our "catch" block.
      return Option.none();
    } else {
      // This is our "try" block's success path.
      const updatedToken = result.right;

      const response = NextResponse.next();
      response.cookies.set("user-session", updatedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60, // 1 hour
        sameSite: "lax",
        path: "/",
      });

      return Option.some(response);
    }
  });
}
