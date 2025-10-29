import {
  deleteCookie,
  COOKIE_NAMES,
  redirect,
} from '../adapters/nextjs/index.js';
import type { AuthConfig } from '../config/schema.js';

// ============================================
// SIGN OUT
// ============================================

/**
 * Signs out the current user.
 *
 * This function:
 * 1. Deletes the session cookie
 * 2. Redirects to home page
 *
 * @param config - Validated auth configuration (unused, for consistency)
 * @returns Never returns (redirects to home)
 */
export async function signOut(_config: AuthConfig): Promise<never> {
  // Step 1: Delete session cookie
  const deleteResult = await deleteCookie(COOKIE_NAMES.SESSION);

  if (deleteResult.isErr()) {
    // Log error but continue with redirect
    console.error('Failed to delete session cookie:', deleteResult.error);
  }

  // Step 2: Redirect to home page
  redirect('/');
}
