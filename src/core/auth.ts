import { validateAuthConfig } from '../config/schema.js';
import type { AuthConfig } from '../config/schema.js';
import type { BaseSignInOptions } from './strategy.js';
import { signOut as handleSignOut } from '../handlers/sign-out.js';
import { handleCallback } from '../handlers/callback.js';
import { createProviders } from './providers.js';
import type { FrameworkAdapter } from './adapter.js';
import { COOKIE_NAMES } from './constants.js';
import { MissingOAuthStateCookieError } from './errors.js';
import { decryptOAuthStateJWE } from './oauth/index.js';
import type { UserSessionPayload } from '../types/index.js';
import { decryptUserSessionJWE } from './session/index.js';

export function createAuthHelpers(
  config: AuthConfig,
  adapter: FrameworkAdapter,
) {
  const validatedConfig = validateAuthConfig(config);
  const providers = createProviders(validatedConfig, adapter);

  return {
    // --------------------------------------------
    // Sign in
    // --------------------------------------------
    signIn: async (providerId: string, options?: BaseSignInOptions) => {
      const provider = providers.get(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }
      await provider.signIn(options);
    },

    // --------------------------------------------
    // Get user session
    // --------------------------------------------
    getUserSession: async (): Promise<UserSessionPayload | null> => {
      // Logic moved from session.ts and inlined
      const jwe = await adapter.getCookie(COOKIE_NAMES.USER_SESSION);
      if (!jwe) {
        return null;
      }

      const sessionResult = await decryptUserSessionJWE({
        jwe,
        secret: validatedConfig.session.secret,
      });

      if (sessionResult.isErr()) {
        return null;
      }
      return sessionResult.value;
    },

    // --------------------------------------------
    // Sign out
    // --------------------------------------------
    signOut: async () => {
      return handleSignOut(validatedConfig, adapter);
    },

    // --------------------------------------------
    //
    // --------------------------------------------
    handleCallback: async (request: Request) => {
      const ouathStateJWE = await adapter.getCookie(COOKIE_NAMES.OAUTH_STATE);
      if (!ouathStateJWE) {
        throw new MissingOAuthStateCookieError();
      }

      const oauthStateResult = await decryptOAuthStateJWE({
        jwe: ouathStateJWE,
        secret: validatedConfig.session.secret,
      });

      if (oauthStateResult.isErr()) {
        throw oauthStateResult.error;
      }

      const oauthState = oauthStateResult.value;
      const providerId = oauthState.provider;
      const provider = providers.get(providerId);

      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }

      return handleCallback(validatedConfig, adapter, provider, request);
    },
  };
}

export type AuthHelpers = ReturnType<typeof createAuthHelpers>;
