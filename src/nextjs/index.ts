import type { AuthConfig } from '../config/schema';
import { createAuthHelpers } from '../core/auth';
import { NextjsAdapter } from './adapter';
import { createExtendUserSessionMiddleware } from './middleware';
import type { AnyAuthProvider } from '../core/strategy';

export function initAuth(config: AuthConfig, providers: AnyAuthProvider[]) {
  const adapter = new NextjsAdapter();

  const authHelpers = createAuthHelpers(config, adapter, providers);

  const extendUserSessionMiddleware = createExtendUserSessionMiddleware(config);

  return { authHelpers, extendUserSessionMiddleware };
}
