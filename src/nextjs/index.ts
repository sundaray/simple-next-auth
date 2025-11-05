import type { AuthConfig } from '../config/schema';
import { createAuthHelpers } from '../core/auth';
import { NextjsAdapter } from './adapter';

export function initAuth(config: AuthConfig) {
  const adapter = new NextjsAdapter();

  const authHelpers = createAuthHelpers(config, adapter);

  return authHelpers;
}
