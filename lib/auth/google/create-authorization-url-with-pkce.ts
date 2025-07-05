import "server-only";
import { Effect, Config, Console } from "effect";
import { generateS256CodeChallenge } from "@/lib/auth/google/generate-s256-code-challenge";

const authorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";

export function createAuthorizationURLWithPKCE(
  state: string,
  codeVerifier: string,
  scopes: string[]
) {
  return Effect.gen(function* () {
    const clientId = yield* Config.string("GOOGLE_CLIENT_ID");
    const redirectUri = yield* Config.string("REDIRECT_URI");

    const codeChallenge = yield* generateS256CodeChallenge(codeVerifier);

    const url = new URL(authorizationEndpoint);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("prompt", "select_account");

    if (scopes.length > 0) {
      url.searchParams.set("scope", scopes.join(" "));
    }

    return url;
  }).pipe(
    Effect.tapErrorTag("ConfigError", (error) => Console.error(error)),
    Effect.tapErrorTag("CodeChallengeGenerationError", (error) =>
      Console.error(error)
    )
  );
}
