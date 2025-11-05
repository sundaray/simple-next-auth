import { getCookie, COOKIE_NAMES } from '../adapters/nextjs/index.js';
import { decryptSessionJWT } from '../core/session/index.js';
import type { SessionData } from '../core/session/index.js';
import type { AuthConfig } from '../config/schema.js';

export async function getSession(
  config: AuthConfig,
): Promise<SessionData | null> {
  // Step 1: Get session cookie
  const cookieResult = await getCookie(COOKIE_NAMES.SESSION);

  if (cookieResult.isErr()) {
    // Error reading cookie - treat as not authenticated
    return null;
  }

  const sessionJWT = cookieResult.value;

  // No session cookie found
  if (!sessionJWT) {
    return null;
  }

  // Step 2: Decrypt and validate session JWT
  const sessionResult = await decryptSessionJWT({
    jwt: sessionJWT,
    secret: config.session.secret,
  });

  if (sessionResult.isErr()) {
    // Invalid or expired session - treat as not authenticated
    return null;
  }

  // Step 3: Return session data
  return sessionResult.value;
}
