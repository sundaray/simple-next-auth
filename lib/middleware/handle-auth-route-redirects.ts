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
  "/auth-error",
];

export function handleAuthRouteRedirects(request: NextRequest) {
  return Effect.gen(function* () {
    const path = request.nextUrl.pathname;
    const isOnAuthRoute = authRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`)
    );

    if (!isOnAuthRoute) {
      return Option.none();
    }

    const userOption = yield* getUserSession().pipe(
      Effect.tapError((error) =>
        Effect.logError("User session check failed in middleware", error)
      ),

      Effect.catchAll(() => Effect.succeed(Option.none()))
    );

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
