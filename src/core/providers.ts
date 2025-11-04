import type { AuthConfig } from '../config/schema';
import type { AuthAdapter } from './adapter';
import type { AnyAuthProvider } from './strategy';
import { GoogleProvider } from '../providers/google';

export function createProviders(config: AuthConfig, adapter: AuthAdapter) {
  const providers = new Map<string, AnyAuthProvider>();

  if (config.providers?.google) {
    providers.set('google', new GoogleProvider(config, adapter));
  }

  return providers;
}
