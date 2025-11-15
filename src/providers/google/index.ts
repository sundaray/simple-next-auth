import { GoogleProvider } from './provider';
import type { GoogleProviderConfig } from './types';
import type { AnyAuthProvider, OAuthProvider } from '../types';

export function Google(config: GoogleProviderConfig): OAuthProvider {
  return new GoogleProvider(config);
}

export type { GoogleProviderConfig };
