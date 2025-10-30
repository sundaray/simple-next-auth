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

/**
 * The main authentication instance returned by initAuth().
 */
export interface Auth {
  /**
   * Sign in methods for different providers.
   */
  signIn: {
    /**
     * Initiates Google OAuth sign-in flow.
     * Redirects user to Google's authorization page.
     *
     * @example
     * ```typescript
     * // In a Server Action
     * 'use server'
     *
     * export async function signInWithGoogle() {
     *   await auth.signIn.google();
     * }
     * ```
     */
    google: () => Promise<never>;
  };

  /**
   * Session management methods.
   */
  session: {
    /**
     * Gets the current user's session.
     * Returns null if not authenticated.
     *
     * @example
     * ```typescript
     * const session = await auth.session.get();
     *
     * if (session) {
     *   console.log(session.email);
     * }
     * ```
     */
    get: () => Promise<SessionData | null>;
  };

  /**
   * Signs out the current user.
   * Deletes session cookie and redirects to home page.
   *
   * @example
   * ```typescript
   * // In a Server Action
   * 'use server'
   *
   * export async function signOut() {
   *   await auth.signOut();
   * }
   * ```
   */
  signOut: () => Promise<never>;

  /**
   * OAuth callback handlers for different providers.
   */
  callback: {
    /**
     * Handles the OAuth callback from Google.
     * Exchanges authorization code for tokens, creates session.
     *
     * @example
     * ```typescript
     * // app/api/auth/callback/google/route.ts
     * import { auth } from '@/lib/auth';
     *
     * export async function GET(request: Request) {
     *   return auth.callback.google(request);
     * }
     * ```
     */
    google: (request: Request) => Promise<never>;
  };
}

// Re-export SessionData type for user convenience
export type { SessionData } from './core/session/index.js';

// ============================================
// INIT AUTH
// ============================================

/**
 * Initializes the authentication library.
 *
 * This function validates your configuration and returns an auth instance
 * with methods for sign-in, session management, and sign-out.
 *
 * @param config - Authentication configuration
 * @returns Auth instance with sign-in, session, and sign-out methods
 *
 * @example
 * ```typescript
 * // lib/auth.ts
 * import { initAuth } from 'simple-auth';
 *
 * export const auth = initAuth({
 *   session: {
 *     secret: process.env.SESSION_SECRET!,
 *     maxAge: 60 * 60 * 24 * 7, // 7 days
 *   },
 *   providers: {
 *     google: {
 *       clientId: process.env.GOOGLE_CLIENT_ID!,
 *       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
 *       redirectUri: 'http://localhost:3000/api/auth/callback/google',
 *     },
 *   },
 * });
 *
 * // Now use it:
 * await auth.signIn.google();           // Sign in
 * const session = await auth.session.get();  // Get session
 * await auth.signOut();                 // Sign out
 * ```
 */
export function initAuth(config: AuthConfig): Auth {
  // Validate configuration
  const validatedConfig = validateAuthConfig(config);

  // Return auth instance
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

// Re-export types
export type {
  AuthConfig,
  SessionConfig,
  GoogleProviderConfig,
} from './config/schema.js';
