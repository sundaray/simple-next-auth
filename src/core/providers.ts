import type { AuthConfig } from '../config/schema';
import type { FrameworkAdapter } from '../types';
import type { AnyAuthProvider } from './strategy';
import { GoogleProvider } from '../providers/google';
import type { AuthProvider } from '../types';

export function createProviders(config: AuthConfig, adapter: FrameworkAdapter) {
  const providers = new Map<
    AuthProvider[keyof AuthProvider],
    AnyAuthProvider
  >();

  if (config.providers?.google) {
    providers.set('google', new GoogleProvider(config, adapter));
  }

  return providers;
}
