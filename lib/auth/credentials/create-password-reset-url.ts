import "server-only";

import { Effect, Config } from "effect";

/************************************************
 *
 * Create password reset verification URL
 *
 ************************************************/

export function createPasswordResetURL(token: string) {
  return Effect.gen(function* () {
    const baseUrl = yield* Config.url("BASE_URL");
    const url = new URL("/api/auth/verify-password-reset", baseUrl);
    url.searchParams.set("token", token);
    return url.toString();
  }).pipe(Effect.tapErrorTag("ConfigError", (error) => Effect.logError(error)));
}
