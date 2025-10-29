// ============================================
// NEXT.JS ADAPTERS - BARREL EXPORT
// ============================================

/**
 * Next.js-specific adapters for cookie and navigation management.
 *
 * These adapters wrap Next.js APIs to provide a consistent interface
 * for the core authentication library.
 *
 * INTERNAL USE ONLY - Not exposed to library users.
 */

// Cookie Management
export { setCookie, getCookie, deleteCookie, COOKIE_NAMES } from './cookies.js';

export type { InternalCookieOptions } from './cookies.js';

// Navigation
export { redirect, RedirectType } from './redirect.js';
