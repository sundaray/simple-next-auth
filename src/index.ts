import { validateAuthConfig } from './config/schema.js';
import type { AuthConfig } from './config/schema.js';
import type { SessionData } from './core/session/index.js';
import { getSession } from './handlers/session.js';
import { signOut as handleSignOut } from './handlers/sign-out.js';
import { handleGoogleCallback } from './handlers/callback.js';
import type { AnyAuthStrategy } from './core/strategy.js';
import type { BaseSignInOptions } from './core/strategy.js';

import { GoogleProvider } from './providers/google.js';

export interface Auth {
  signIn: (providerId: string, options?: BaseSignInOptions) => Promise<never>;

  getUserSession: () => Promise<SessionData | null>;

  signOut: () => Promise<never>;

  callback: {
    handle: (request: Request) => Promise<never>;
  };
}

export type { SessionData } from './core/session/index.js';

// ============================================
// INIT AUTH
// ============================================

export function initAuth(config: AuthConfig): Auth {
  const validatedConfig = validateAuthConfig(config);

  const strategies = new Map<string, AnyAuthStrategy>();

  if (validatedConfig.providers?.google) {
    strategies.set('google', new GoogleProvider(validatedConfig));
  }

  return {
    signIn: async (providerId, options) => {
      const strategy = strategies.get(providerId);
      return strategy?.signIn();
    },

    getUserSession: async () => {
      return getSession(validatedConfig);
    },

    signOut: async () => {
      return handleSignOut(validatedConfig);
    },

    callback: {
      handle: async (request: Request) => {
        return handleGoogleCallback(validatedConfig, request);

        // Create session
      },
    },
  };
}

// ============================================
// RE-EXPORTS FOR USER CONVENIENCE
// ============================================

export type {
  AuthConfig,
  SessionConfig,
  GoogleProviderConfig,
} from './config/schema.js';
