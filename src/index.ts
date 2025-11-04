import { validateAuthConfig } from './config/schema.js';
import type { AuthConfig } from './config/schema.js';
import type { AnyAuthProvider } from './core/strategy.js';
import type { SessionData } from './core/session/index.js';
import type { BaseSignInOptions } from './core/strategy.js';
import { getSession } from './handlers/session.js';
import { signOut as handleSignOut } from './handlers/sign-out.js';

import { GoogleProvider } from './providers/google.js';

import type { AuthAdapter } from './core/adapter.js';
import { COOKIE_NAMES } from './core/constants.js';
import { MissingOAuthStateCookieError } from './core/errors.js';
import { decryptOAuthStateJWT } from './core/oauth/decrypt-oauth-state-jwe.js';
import { createProviders } from './core/providers.js';

export interface Auth {
  signIn: (providerId: string, options?: BaseSignInOptions) => Promise<void>;

  getUserSession: () => Promise<SessionData | null>;

  signOut: () => Promise<never>;

  callback: {
    handle: (request: Request) => Promise<never>;
  };
}

export type { SessionData } from './core/session/index.js';

// ============================================
//
// INIT AUTH
//
// ============================================

export function initAuth(config: AuthConfig) {}
const validatedConfig = validateAuthConfig(config);
const providers = createProviders(validatedConfig, adapter);

const strategies = new Map<string, AnyAuthProvider>();

if (validatedConfig.providers?.google) {
  strategies.set('google', new GoogleProvider(validatedConfig));
}

const authObject: Auth = {
  signIn: async (providerId: string, options?: BaseSignInOptions) => {
    const provider = providers.get(providerId);
    await provider.signIn(options);
  },

  getUserSession: async () => {
    return getSession(validatedConfig);
  },

  signOut: async () => {
    return handleSignOut(validatedConfig, adapter);
  },

  handleCallback: async (request: Request) => {
    // Get OAuth state cookie
    const ouathStateJWE = await adapter.getCookie(COOKIE_NAMES.OAUTH_STATE);

    if (!ouathStateJWE) {
      throw new MissingOAuthStateCookieError();
    }

    // Decrypt OAuth state cookie to get the provider ID
    const oauthStateResult = await decryptOAuthStateJWT({
      jwt: ouathStateJWE,
      secret: validateAuthConfig.session.secret,
    });

    if (oauthStateResult.isErr()) {
      throw oauthStateResult.error;
    }

    const oauthState = oauthStateResult.value;

    const providerId = oauthState.provider;

    const provider = providers.get(providerId);

    return processCallback(validatedConfig, adapter, provider, request);
  },
};

// ============================================
// RE-EXPORTS FOR USER CONVENIENCE
// ============================================

export type {
  AuthConfig,
  SessionConfig,
  GoogleProviderConfig,
} from './config/schema.js';
