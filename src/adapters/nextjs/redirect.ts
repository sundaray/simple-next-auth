import { redirect as nextRedirect, RedirectType } from 'next/navigation';

// ============================================
// REDIRECT
// ============================================

/**
 * Redirects to a URL using Next.js navigation.
 *
 * IMPORTANT: Next.js redirect() works by throwing a NEXT_REDIRECT error.
 * This is EXPECTED behavior - the error is caught by Next.js internally
 * to perform the navigation.
 *
 * From Next.js docs:
 * "Invoking the redirect() function throws a NEXT_REDIRECT error and
 * terminates rendering of the route segment in which it was thrown."
 *
 * "redirect should be called outside the try block when using try/catch statements."
 *
 * Status Codes:
 * - Route Handlers & Server Components: 307 (Temporary) or 308 (Permanent)
 * - Server Actions: 303 (See Other) - used after POST requests
 *
 * INTERNAL USE ONLY - Not exposed to library users.
 *
 */
export function redirect(path: string, type?: RedirectType): never {
  if (!isValidRedirectUrl(path)) {
    throw new Error(`Invalid redirect URL: ${path}`);
  }

  // Call Next.js redirect - this will throw NEXT_REDIRECT error
  // which is caught by Next.js to perform the navigation
  if (type) {
    nextRedirect(path, type);
  } else {
    nextRedirect(path);
  }
}

// ============================================
// EXPORT REDIRECT TYPE
// ============================================

/**
 * Re-export RedirectType for type safety.
 *
 * Usage:
 * ```typescript
 * redirect('/dashboard', RedirectType.replace);
 * redirect('/dashboard', RedirectType.push);
 * ```
 */
export { RedirectType };

// ============================================
// HELPER: URL VALIDATION
// ============================================

/**
 * Validates if a URL is safe for redirect.
 *
 * Accepts:
 * - Relative paths starting with / (e.g., /dashboard)
 * - Valid absolute URLs (e.g., https://example.com)
 *
 * Rejects:
 * - Invalid URLs
 * - Potentially dangerous URLs (javascript:, data:, etc.)
 */
function isValidRedirectUrl(url: string): boolean {
  // Allow relative paths
  if (url.startsWith('/')) {
    return true;
  }

  // Validate absolute URLs
  try {
    const parsed = new URL(url);

    // Only allow http and https protocols (block javascript:, data:, etc.)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
