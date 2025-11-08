import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  decryptUserSessionJWE,
  encryptUserSessionPayload,
} from '../core/session';
import type { AuthConfig } from '../config/schema';
import { COOKIE_NAMES } from '../core/constants';

export async function extendUserSessionExpiry(
  userSessionJWE: string,
  config: AuthConfig,
) {
  const userSessionPayloadResult = await decryptUserSessionJWE({
    jwe: userSessionJWE,
    secret: config.session.secret,
  });

  if (userSessionPayloadResult.isErr()) {
    return null;
  }

  const userSessionPayload = userSessionPayloadResult.value;

  const newUserSessionJWEResult = await encryptUserSessionPayload({
    userSessionPayload: userSessionPayload,
    secret: config.session.secret,
    maxAge: config.session.maxAge,
  });

  if (newUserSessionJWEResult.isErr()) {
    return null;
  }

  const newUserSessionJWE = newUserSessionJWEResult.value;

  return newUserSessionJWE;
}

export function createExtendUserSessionMiddleware(config: AuthConfig) {
  return async function extendUserSessionMiddleware(request: NextRequest) {
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
  };
}
