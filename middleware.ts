import { NextRequest, NextResponse } from "next/server";
import { Effect, Option } from "effect";
import { handleAuthRouteRedirects } from "@/lib/middleware/handle-auth-route-redirects";
import { handleUserSessionExtension } from "@/lib/middleware/handle-user-session-extension";

export async function middleware(request: NextRequest) {
  const workflow = Effect.gen(function* () {
    const redirectResponseOption = yield* handleAuthRouteRedirects(request);

    if (Option.isSome(redirectResponseOption)) {
      return redirectResponseOption;
    }

    return yield* handleUserSessionExtension(request);
  });

  const finalResponseOption = await Effect.runPromise(workflow);

  return Option.getOrElse(finalResponseOption, () => NextResponse.next());
}

export const config = {
  matcher: [
    // Skip all static files and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
