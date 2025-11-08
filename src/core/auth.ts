import type { AuthConfig } from '../config/schema.js';
import { COOKIE_NAMES, OAUTH_STATE_MAX_AGE } from './constants.js';
import { MissingOAuthStateCookieError } from './errors.js';

import type { UserSessionPayload } from '../types/index.js';
import type { AuthProvider, FrameworkAdapter } from '../types';
import type { AnyAuthProvider } from './strategy.js';

import {
  encryptUserSessionPayload,
  createUserSessionPayload,
  setUserSessionCookie,
  deleteOAuthStateCookie,
  decryptUserSessionJWE,
} from './session/index.js';

import {
  decryptOAuthStateJWE,
  encryptOAuthStatePayload,
} from './oauth/index.js';

import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from './pkce';

export function createAuthHelpers(
  config: AuthConfig,
  adapter: FrameworkAdapter,
  providers: AnyAuthProvider[],
) {
  const providersMap = new Map<AuthProvider, AnyAuthProvider>();
  for (const provider of providers) {
    providersMap.set(provider.id, provider);
  }

  return {
    // --------------------------------------------
    // Sign in
    // --------------------------------------------
    signIn: async (
      providerId: AuthProvider[keyof AuthProvider],
      options?: BaseSignInOptions,
    ) => {
      const provider = providersMap.get(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }
      if (provider.type === 'oauth') {
        // 1. Generate state
        const stateResult = generateState();
        if (stateResult.isErr()) throw stateResult.error;

        // 2. Generate code verifier
        const codeVerifierResult = generateCodeVerifier();
        if (codeVerifierResult.isErr()) throw codeVerifierResult.error;

        // 3. Generate code challenge
        const codeChallengeResult = await generateCodeChallenge(
          codeVerifierResult.value,
        );
        if (codeChallengeResult.isErr()) throw codeChallengeResult.error;

        // 4. Create OAuth state JWE
        const oauthStateJWEResult = await encryptOAuthStatePayload({
          oauthState: {
            state: stateResult.value,
            codeVerifier: codeVerifierResult.value,
            redirectTo: options?.redirectTo || '/',
            provider: provider.id,
          },
          secret: config.session.secret,
          maxAge: OAUTH_STATE_MAX_AGE,
        });
        if (oauthStateJWEResult.isErr()) throw oauthStateJWEResult.error;

        const authorizationUrlResult = provider.getAuthorizationUrl({
          state: stateResult.value,
          codeChallenge: codeChallengeResult.value,
        });
        if (authorizationUrlResult.isErr()) throw authorizationUrlResult.error;

        // Use the adapter to set the cookie
        await adapter.setCookie(
          COOKIE_NAMES.OAUTH_STATE,
          oauthStateJWEResult.value,
          {
            maxAge: OAUTH_STATE_MAX_AGE,
          },
        );

        // Use the adapter to redirect
        adapter.redirect(authorizationUrlResult.value);
      }
    },
    // --------------------------------------------
    // Sign out
    // --------------------------------------------
    signOut: async () => {
      await adapter.deleteCookie(COOKIE_NAMES.USER_SESSION);
      adapter.redirect('/');
    },
    // --------------------------------------------
    // Get user session
    // --------------------------------------------
    getUserSession: async (): Promise<UserSessionPayload | null> => {
      const jwe = await adapter.getCookie(COOKIE_NAMES.USER_SESSION);
      if (!jwe) {
        return null;
      }

      const sessionResult = await decryptUserSessionJWE({
        jwe,
        secret: config.session.secret,
      });

      if (sessionResult.isErr()) {
        return null;
      }
      return sessionResult.value;
    },

    // --------------------------------------------
    // Handle Callback
    // --------------------------------------------
    handleCallback: async (request: Request) => {
      const ouathStateJWE = await adapter.getCookie(COOKIE_NAMES.OAUTH_STATE);
      if (!ouathStateJWE) {
        throw new MissingOAuthStateCookieError();
      }

      // Decrypt OAuth state cookie
      const oauthStateResult = await decryptOAuthStateJWE({
        jwe: ouathStateJWE,
        secret: config.session.secret,
      });

      if (oauthStateResult.isErr()) {
        throw oauthStateResult.error;
      }

      const oauthState = oauthStateResult.value;
      const providerId = oauthState.provider;
      const provider = providersMap.get(providerId);

      // Fix this
      if (!provider || provider.type !== 'oauth') {
        throw new Error(
          `Provider ${oauthState.provider} not found or is not an OAuth provider`,
        );
      }

      // Handle the callback
      const providerResult = await provider.handleCallback(request, oauthState);

      // 5. Handle the Result (error or success)
      if (providerResult.isErr()) {
        console.error('[AUTH_ERROR]', providerResult.error);
        adapter.redirect(`/auth/error?error=${providerResult.error.name}`);
        return;
      }

      // 6. Get the user claims
      const providerUser = providerResult.value;

      // Call the user's onSignIn callback
      let customSessionData = {};
      if (config.callbacks?.onSignIn) {
        customSessionData = await config.callbacks.onSignIn(providerUser);
      }

      // Create the final session payload
      const sessionPayloadResult = await createUserSessionPayload({
        authConfig: config,
        providerName: provider.id,
        providerUserClaims: customSessionData, // Pass user's custom data
      });
      if (sessionPayloadResult.isErr()) throw sessionPayloadResult.error;

      // 9. Encrypt the user session payload
      const sessionJWEResult = await encryptUserSessionPayload({
        userSessionPayload: sessionPayloadResult.value,
        secret: config.session.secret,
        maxAge: config.session.maxAge,
      });
      if (sessionJWEResult.isErr()) throw sessionJWEResult.error;

      // 10. Set the user session
      await setUserSessionCookie({
        frameworkAdapter: adapter,
        authConfig: config,
        jwe: sessionJWEResult.value,
      });

      // 11. Delete the OAuth state cookie
      await deleteOAuthStateCookie({ frameworkAdapter: adapter });

      // 12. Redirect users to their intended destination
      const redirectTo = oauthState.redirectTo;
      adapter.redirect(redirectTo, 'replace');
    },
  };
}

export type AuthHelpers = ReturnType<typeof createAuthHelpers>;
