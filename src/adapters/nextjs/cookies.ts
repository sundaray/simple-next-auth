import { cookies } from 'next/headers';
import { ResultAsync } from 'neverthrow';

// ============================================
// COOKIE NAMES
// ============================================

/**
 * Determines if we're in a secure context (HTTPS).
 * Uses NODE_ENV as a simple heuristic.
 */
const isSecureContext = process.env.NODE_ENV === 'production';

/**
 * Cookie name prefixes based on security context.
 *
 * Production (HTTPS):
 * - Uses __Host- prefix for maximum security
 *
 * Development (HTTP localhost):
 * - Uses plain names (__Host- requires HTTPS)
 */
const COOKIE_PREFIX = isSecureContext ? '__Host-simple-auth.' : 'simple-auth.';

/**
 * Cookie names used by the library.
 * NOT configurable by users - these are implementation details.
 */
export const COOKIE_NAMES = {
  SESSION: `${COOKIE_PREFIX}session`,
  OAUTH_STATE: `${COOKIE_PREFIX}oauth-state`,
} as const;

// ============================================
// ERROR TYPES
// ============================================

type CookieOperationError = {
  type: 'COOKIE_OPERATION_ERROR';
  message: string;
  cause?: unknown;
};

// ============================================
// COOKIE OPTIONS (INTERNAL USE ONLY)
// ============================================

/**
 * Internal cookie options.
 * Security-critical options are hardcoded and not configurable.
 */
export interface InternalCookieOptions {
  maxAge: number; // Only configurable option (session lifetime)
}

// ============================================
// SET COOKIE (INTERNAL)
// ============================================

/**
 * Sets a cookie using Next.js cookies() API.
 *
 * Security options are hardcoded:
 * - httpOnly: true (prevents XSS attacks)
 * - secure: true in production (HTTPS only)
 * - sameSite: 'lax' (CSRF protection + OAuth compatibility)
 * - path: '/' (site-wide availability, required for __Host-)
 *
 * INTERNAL USE ONLY - Not exposed to library users.
 *
 * @param name - Cookie name (use COOKIE_NAMES constants)
 * @param value - Cookie value (a JWT)
 * @param options - Only maxAge is configurable
 */
export function setCookie(
  name: string,
  value: string,
  options: InternalCookieOptions,
): ResultAsync<void, CookieOperationError> {
  return ResultAsync.fromPromise(
    (async () => {
      const cookieStore = await cookies();

      cookieStore.set(name, value, {
        maxAge: options.maxAge,
        httpOnly: true,
        secure: isSecureContext,
        sameSite: 'lax',
        path: '/',
      });
    })(),
    (error): CookieOperationError => ({
      type: 'COOKIE_OPERATION_ERROR',
      message: `Failed to set cookie: ${name}`,
      cause: error,
    }),
  );
}

// ============================================
// GET COOKIE (INTERNAL)
// ============================================

/**
 * Gets a cookie value using Next.js cookies() API.
 * *
 * @param name - Cookie name (use COOKIE_NAMES constants)
 * @returns Cookie value or undefined if not found
 */
export function getCookie(
  name: string,
): ResultAsync<string | undefined, CookieOperationError> {
  return ResultAsync.fromPromise(
    (async () => {
      const cookieStore = await cookies();
      const cookie = cookieStore.get(name);
      return cookie?.value;
    })(),
    (error): CookieOperationError => ({
      type: 'COOKIE_OPERATION_ERROR',
      message: `Failed to get cookie: ${name}`,
      cause: error,
    }),
  );
}

// ============================================
// DELETE COOKIE (INTERNAL)
// ============================================

/**
 * Deletes a cookie using Next.js cookies() API.
 *
 * @param name - Cookie name (use COOKIE_NAMES constants)
 */
export function deleteCookie(
  name: string,
): ResultAsync<void, CookieOperationError> {
  return ResultAsync.fromPromise(
    (async () => {
      const cookieStore = await cookies();
      cookieStore.delete(name);
    })(),
    (error): CookieOperationError => ({
      type: 'COOKIE_OPERATION_ERROR',
      message: `Failed to delete cookie: ${name}`,
      cause: error,
    }),
  );
}
