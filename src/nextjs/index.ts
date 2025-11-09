import { createAuthHelpers } from '../core/auth';
import { NextjsAdapter } from './adapter';
import { createExtendUserSessionMiddleware } from './middleware';
import type { AuthConfig } from '../types';
import { lazyInit } from '../core/utils/lazy-init';

interface AuthInstance {
  authHelpers: ReturnType<typeof createAuthHelpers>;
  extendUserSessionMiddleware: ReturnType<
    typeof createExtendUserSessionMiddleware
  >;
}

let initAuthInstance: (() => AuthInstance) | null = null;

export function initAuth(config: AuthConfig) {
  if (initAuthInstance) {
    const instance = initAuthInstance;
    return {
      authHelpers: () => instance().authHelpers,
      extendUserSessionMiddleware: () => instance().extendUserSessionMiddleware,
    };
  }

  const init = () => {
    const adapter = new NextjsAdapter();

    const { providers } = config;

    const authHelpers = createAuthHelpers(config, adapter, providers);

    const extendUserSessionMiddleware =
      createExtendUserSessionMiddleware(config);

    return { authHelpers, extendUserSessionMiddleware };
  };

  const getSingleton = lazyInit(init);
  initAuthInstance = getSingleton;

  return {
    authHelpers: () => getSingleton().authHelpers,
    extendUserSessionMiddleware: () =>
      getSingleton().extendUserSessionMiddleware,
  };
}
