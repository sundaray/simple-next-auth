import type { AuthConfig } from '../config/schema';
import type { AuthAdapter } from '../core/adapter';
import type { AnyAuthProvider } from '../core/strategy';
import { createSessionJWT } from '../core/session';
import { COOKIE_NAMES } from '../core/constants';

export async function handleCallback(
  config: AuthConfig,
  adapter: AuthAdapter,
  provider: AnyAuthProvider,
  request: Request,
): Promise<void> {
  // Provider runs callback
  const authResult = await provider.handleCallback(request);

  // Core user session data (always present)
  const coreUserSessionPayload = {
    createdAt: Date.now(),
    expiresAt: Date.now() + config.session.maxAge * 1000,
    secret: config.session.secret,
    maxAge: config.session.maxAge,
    provider: authResult.oauthState.provider,
  };

  // Run user's onSignin callback and get the custom user dession data the user wants to add in the user session
  let customUserSessionPayload: Record<string, unknown> = {};

  if (config.callbacks?.onSignIn) {
    try {
      customUserSessionPayload = await config.callbacks.onSignIn(
        authResult.userClaims,
      );
    } catch (error) {}
  }

  // Merge core data with custom data
  const userSessionPayload = {
    ...coreUserSessionPayload,
    ...customUserSessionPayload,
  };

  // Create user session JWE
  const userSessionJWEResult = await createSessionJWT(userSessionPayload);

  if (userSessionJWEResult.isErr()) {
    throw userSessionJWEResult.error;
  }

  const userSessionJWE = userSessionJWEResult.value;

  // Set user session cookie
  await adapter.setCookie(COOKIE_NAMES.USER_SESSION, userSessionJWE, {
    maxAge: config.session.maxAge,
  });

  // Delete OAuth state cookie
  await adapter.deleteCookie(COOKIE_NAMES.OAUTH_STATE);

  // Redirect user to their intended destination
  const redirectTo = authResult.oauthState.redirectTo || '/';
  adapter.redirect(redirectTo, 'replace');
}
