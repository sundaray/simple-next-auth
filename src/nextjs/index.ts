import { createAuthHelpers } from '../core/auth';
import { NextjsAdapter } from './adapter';
import { createExtendUserSessionMiddleware } from './middleware';
import type { AuthConfig } from '../types';

export function initAuth(config: AuthConfig) {
  const adapter = new NextjsAdapter();

  const { providers } = config;

  const authHelpers = createAuthHelpers(config, adapter, providers);

  const extendUserSessionMiddleware = createExtendUserSessionMiddleware(config);

  return { authHelpers, extendUserSessionMiddleware };
}
