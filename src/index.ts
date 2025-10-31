import { validateAuthConfig } from './config/schema.js';
import type { AuthConfig } from './config/schema.js';
import type { SessionData } from './core/session/index.js';
import { signInWithGoogle } from './handlers/sign-in.js';
import { getSession } from './handlers/session.js';
import { signOut as handleSignOut } from './handlers/sign-out.js';
import { handleGoogleCallback } from './handlers/callback.js';

// ============================================
// TYPES
// ============================================

export interface Auth {
  signIn: {
    google: () => Promise<never>;
  };
  session: {
    get: () => Promise<SessionData | null>;
  };
  signOut: () => Promise<never>;

  callback: {
    google: (request: Request) => Promise<never>;
  };
}

export type { SessionData } from './core/session/index.js';

// ============================================
// INIT AUTH
// ============================================

export function initAuth(config: AuthConfig): Auth {
  const validatedConfig = validateAuthConfig(config);

  return {
    signIn: {
      google: async () => {
        return signInWithGoogle(validatedConfig);
      },
    },

    session: {
      get: async () => {
        return getSession(validatedConfig);
      },
    },

    signOut: async () => {
      return handleSignOut(validatedConfig);
    },

    callback: {
      google: async (request: Request) => {
        return handleGoogleCallback(validatedConfig, request);
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
