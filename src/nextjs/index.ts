import { createAuthHelpers } from '../core/auth';
import { NextJsSessionStorage } from './session-storage';
import { createExtendUserSessionMiddleware } from './middleware';
import type { AuthConfig } from '../types';
import type { AuthHelpers } from '../core/auth';
import { lazyInit } from '../core/utils/lazy-init';
import { redirect as nextRedirect, RedirectType } from 'next/navigation';
import { COOKIE_NAMES, OAUTH_STATE_MAX_AGE } from '../core/constants';

interface AuthInstance {
  signIn: (
    providerId: 'google',
    options?: { redirectTo: `/${string}` },
  ) => Promise<void>;
  signOut: () => Promise<void>;
  getUserSession: (
    request: Request,
  ) => ReturnType<AuthHelpers<Request, unknown>['getUserSession']>;
  handleCallback: (request: Request) => Promise<void>;
}

let instance: (() => AuthInstance) | null = null;

export function initAuth(config: AuthConfig) {
  if (!instance) {
    const init = () => {
      const userSessionStorage = new NextJsSessionStorage(
        config,
        COOKIE_NAMES.USER_SESSION,
        {
          maxAge: config.session.maxAge,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        },
      );

      const oauthStateStorage = new NextJsSessionStorage(
        config,
        COOKIE_NAMES.OAUTH_STATE,
        {
          maxAge: OAUTH_STATE_MAX_AGE,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        },
      );

      const { providers } = config;

      const authHelpers = createAuthHelpers<Request, unknown>(
        config,
        userSessionStorage,
        oauthStateStorage,
        providers,
      );

      const extendUserSessionMiddleware =
        createExtendUserSessionMiddleware(config);

      return { authHelpers, extendUserSessionMiddleware };
    };

    const authHelpers: AuthInstance = {
      signIn: async () => {},
      signOut: async () => {
        const { redirectTo } = await authHelpers.signOut();
        nextRedirect(redirectTo);
      },
      getUserSession: async (request: Request) => {
        return authHelpers.getUserSession(request)
      },
      extendUserSessionMiddleware,
    handleCallback: async (request: Request) => 
    };
return authHelpers
  }

    instance = lazyInit(init);
  }

  return instance();
}
