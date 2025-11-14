import type { AuthConfig } from '../types';
import { OAUTH_STATE_MAX_AGE } from './constants.js';
import {
  MissingOAuthStateCookieError,
  ProviderNotFoundError,
} from './oauth/errors';

import type {
  UserSessionPayload,
  SessionStorage,
} from '../core/session/types.js';
import type { AuthProviderId, SignInOptions } from '../types';
import type { AnyAuthProvider } from '../providers/types';

import {
  encryptUserSessionPayload,
  createUserSessionPayload,
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

/**
 * Core Authentication Helpers - Framework Agnostic
 *
 * @param config - Global auth configuration (baseUrl, secret, session config)
 * @param userSessionStorage - Session storage adapter (framework-specific)
 * @param oauthStateStorage - OAuth state storage adapter (framework-specific)
 * @param providers - Array of auth providers (Google, Credential, etc.)
 *
 * @returns Auth helper functions that framework adapters use
 */
export function createAuthHelpers<TRequest, TResponse>(
  config: AuthConfig,
  userSessionStorage: SessionStorage<TRequest, TResponse>,
  oauthStateStorage: SessionStorage<TRequest, TResponse>,
  providers: AnyAuthProvider[],
) {
  const providersMap = new Map<AuthProviderId, AnyAuthProvider>();

  for (const provider of providers) {
    providersMap.set(provider.id, provider);
  }

  const credentialProvider = providers.find(
    (provider) => provider.type === 'credential',
  );

  return {
    // --------------------------------------------
    // Sign in
    // --------------------------------------------
    signIn: async (
      providerId: AuthProviderId,
      options?: SignInOptions,
    ): Promise<{ authorizationUrl: string }> => {
      const provider = providersMap.get(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }
      if (provider.type === 'oauth') {
        // Generate state
        const stateResult = generateState();
        if (stateResult.isErr()) throw stateResult.error;

        // Generate code verifier
        const codeVerifierResult = generateCodeVerifier();
        if (codeVerifierResult.isErr()) throw codeVerifierResult.error;

        // Generate code challenge
        const codeChallengeResult = await generateCodeChallenge(
          codeVerifierResult.value,
        );
        if (codeChallengeResult.isErr()) throw codeChallengeResult.error;

        // Create OAuth state JWE
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

        // Get authorization URL
        const authorizationUrlResult = provider.getAuthorizationUrl({
          state: stateResult.value,
          codeChallenge: codeChallengeResult.value,
        });
        if (authorizationUrlResult.isErr()) throw authorizationUrlResult.error;

        // Use the oauthstateStorage instance to save the cookie
        await oauthStateStorage.saveSession(
          undefined,
          oauthStateJWEResult.value,
        );

        // Use the framework to redirect
        return { authorizationUrl: authorizationUrlResult.value };
      }

      return { authorizationUrl: '' };
    },
    // --------------------------------------------
    // Sign up
    // --------------------------------------------

    signUp: async (
      providerId: AuthProviderId,
      data: { email: string; password: string; [key: string]: unknown },
    ): Promise<{ success: boolean }> => {
      if (!providerId) {
        return { success: false };
      }

      if (!credentialProvider) {
        return { success: false };
      }
      const result = await credentialProvider.signUp(data);

      if (result.isErr()) {
        return { success: false };
      }

      return { success: true };
    },
    // --------------------------------------------
    // Sign out
    // --------------------------------------------
    signOut: async (): Promise<{ redirectTo: string }> => {
      await userSessionStorage.deleteSession(undefined);
      return { redirectTo: '/' };
    },
    // --------------------------------------------
    // Get user session
    // --------------------------------------------
    getUserSession: async (
      request: TRequest,
    ): Promise<UserSessionPayload | null> => {
      const jwe = await userSessionStorage.getSession(request);
      if (!jwe) return null;

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
    handleCallback: async (
      request: TRequest & Request,
    ): Promise<{ redirectTo: `/${string}` }> => {
      const ouathStateJWE = await oauthStateStorage.getSession(request);
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

      if (!provider) {
        throw new ProviderNotFoundError({ providerId });
      }

      // Handle the callback
      const providerResult = await provider.completeAuthentication(
        request,
        oauthState,
      );

      // 5. Handle the Result (error or success)
      if (providerResult.isErr()) {
        throw providerResult.error;
      }

      // 6. Get the user claims
      const providerUser = providerResult.value;

      // Call the user's onSignIn callback
      let customSessionData = {};
      if (config.onAuthenticated) {
        customSessionData = await config.onAuthenticated(providerUser);
      }

      // Create the final session payload
      const sessionPayloadResult = await createUserSessionPayload({
        authConfig: config,
        providerName: provider.id,
        providerUserClaims: customSessionData,
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
      await userSessionStorage.saveSession(undefined, sessionJWEResult.value);

      // 11. Delete the OAuth state cookie
      await oauthStateStorage.deleteSession(undefined);

      // 12. Redirect users to their intended destination
      const redirectTo = oauthState.redirectTo || '/';
      return { redirectTo };
    },

    // --------------------------------------------
    // Handle email verification
    // --------------------------------------------

    handleVerifyEmail: async () => {
      // Extract token from the URL query parameter
      const url = new URL(request.url);
      const token = url.searchParams.get('token');

      // Handle missing token

      if (!token) {
      }
      // Verify token
      const result = await credentialProvider?.verifyEmail(token);

      // Handle verification result - error case
      if (result?.isErr()) {
        const errorUrl = credentialProvider?.config.emailVerification.onError;
        return { redirectTo: errorUrl };
      }

      // Handle verification result - success case
      const successUrl = credentialProvider?.config.emailVerification.onSuccess;
      return {
        redirectTo: successUrl,
      };
    },
  };
}

export type AuthHelpers<TRequest, TResponse> = ReturnType<
  typeof createAuthHelpers<TRequest, TResponse>
>;
