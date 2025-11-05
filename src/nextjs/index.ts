import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { AuthConfig } from '../config/schema';
import { createAuthHelpers } from '../core/auth';
import { NextjsAdapter } from './adapter';
import { COOKIE_NAMES } from '../core/constants';
import { extendUserSessionExpiry } from '../core/extend-user-session-expiry';

export function initAuth(config: AuthConfig) {
  const adapter = new NextjsAdapter();

  const authHelpers = createAuthHelpers(config, adapter);

  async function extendUserSessionMiddleware(request: NextRequest) {
    const response = NextResponse.next();

    if (request.method !== 'GET') {
      return response;
    }

    const userSessionJWE = request.cookies.get(COOKIE_NAMES.USER_SESSION);

    if (!userSessionJWE) {
      return response;
    }

    const newUserSessionJWE = await extendUserSessionExpiry(
      userSessionJWE.value,
      config,
    );

    if (newUserSessionJWE) {
      response.cookies.set(COOKIE_NAMES.USER_SESSION, newUserSessionJWE, {
        maxAge: config.session.maxAge,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    return response;
  }

  return { authHelpers, extendUserSessionMiddleware };
}
