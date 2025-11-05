import type { AuthConfig } from '../config/schema';
import type { FrameworkAdapter } from './adapter';
import type { AnyAuthProvider } from './strategy';
import { GoogleProvider } from '../providers/google';

export function createProviders(config: AuthConfig, adapter: FrameworkAdapter) {
  const providers = new Map<string, AnyAuthProvider>();

  if (config.providers?.google) {
    providers.set('google', new GoogleProvider(config, adapter));
  }

  return providers;
}
