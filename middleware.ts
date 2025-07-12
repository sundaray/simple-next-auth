import { NextRequest, NextResponse } from "next/server";
import { Effect, Option } from "effect";
import { handleAuthRouteRedirects } from "@/lib/middleware/handle-auth-route-redirects";
import { handleUserSessionExtension } from "@/lib/middleware/handle-user-session-extension";

export async function middleware(request: NextRequest) {
  const workflow = Effect.gen(function* () {
    // Step A: Check if the user needs to be redirected from an auth route.
    const redirectResponseOption = yield* handleAuthRouteRedirects(request);

    // If the first handler returned a `Some(response)`, it means a redirect is
    // necessary. We should stop here and return that response immediately.
    if (Option.isSome(redirectResponseOption)) {
      return redirectResponseOption;
    }

    // Step B: If no redirect was needed, proceed to the next handler.
    // In this case, we try to extend the user's session. The result of this
    // handler will be the final result of our entire workflow.
    // It will be either `Some(responseWithNewCookie)` or `None`.
    return yield* handleUserSessionExtension(request);
  });

  // 2. Execute the workflow.
  const finalResponseOption = await Effect.runPromise(workflow);

  // 3. Interpret the final result.
  //    - If the workflow produced `Some(response)`, we return that response.
  //    - If the workflow produced `None`, it means no specific action was needed,
  //      so we proceed to the requested page with NextResponse.next().
  return Option.getOrElse(finalResponseOption, () => NextResponse.next());
}

export const config = {
  matcher: [
    // Skip all static files and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
