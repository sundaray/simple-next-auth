import {
  deleteCookie,
  COOKIE_NAMES,
  redirect,
} from '../adapters/nextjs/index.js';
import type { AuthConfig } from '../config/schema.js';

// ============================================
// SIGN OUT
// ============================================

export async function signOut(_config: AuthConfig): Promise<void> {
  const deleteResult = await deleteCookie(COOKIE_NAMES.SESSION);

  if (deleteResult.isErr()) {
    console.error('Failed to delete session cookie:', deleteResult.error);
  }

  // Step 2: Redirect to home page
  redirect('/');
}
