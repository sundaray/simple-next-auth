import { GoogleProvider } from './provider';
import type { GoogleProviderConfig } from '../../config/schema';
import type { AnyAuthProvider } from '../../core/strategy';

export function Google(config: GoogleProviderConfig): AnyAuthProvider {
  return new GoogleProvider(config);
}

export type { GoogleProviderConfig };
