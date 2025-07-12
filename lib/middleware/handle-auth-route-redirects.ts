import { NextRequest, NextResponse } from "next/server";
import { Effect, Option } from "effect";
import { getUserSession } from "@/lib/auth/session/get-user-session";

const authRoutes = [
  "/signin",
  "/forgot-password",
  "/forgot-password/check-email",
  "/forgot-password/error",
  "/reset-password",
  "/reset-password/success",
  "/signup",
  "/signup/check-email",
  "/signup/error",
  "/signup/success",
];

/**
 * Creates an Effect workflow to handle redirects for authenticated users on auth pages.
 */
export function handleAuthRouteRedirects(request: NextRequest) {
  return Effect.gen(function* () {
    const path = request.nextUrl.pathname;
    const isOnAuthRoute = authRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`)
    );

    if (!isOnAuthRoute) {
      return Option.none();
    }

    // This is the key part, now simplified.
    // We try to get the session, and if the effect itself fails,
    // we log the error and treat it as if the user is not logged in.
    const userOption = yield* getUserSession().pipe(
      Effect.catchAll((error) =>
        // The fallback logic:
        // 1. Log the error for debugging.
        // 2. Replace the failed Effect with a new, successful Effect
        //    that simply resolves to the value `Option.none()`.
        Effect.logError("Session check failed in middleware", error).pipe(
          Effect.as(Option.none())
        )
      )
    );

    // Now, `userOption` is GUARANTEED to be an `Option<UserSession>`.
    // The effect did not crash. We can now use a simple `if` check.
    if (Option.isSome(userOption)) {
      // User IS logged in and IS on an auth route -> Redirect.
      const redirectUrl = new URL("/", request.nextUrl);
      return Option.some(NextResponse.redirect(redirectUrl));
    } else {
      // User is NOT logged in and IS on an auth route -> Allow.
      return Option.none();
    }
  });
}
