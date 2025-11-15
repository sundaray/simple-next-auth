import type { AuthProviderId, AnyAuthProvider } from '../../providers/types';

import { ProviderNotFoundError } from './errors';

export class ProviderRegistry {
  private providers: Map<AuthProviderId, AnyAuthProvider>;

  constructor(providers: AnyAuthProvider[]) {
    this.providers = new Map(
      providers.map((provider) => [provider.id, provider]),
    );
  }

  get(id: AuthProviderId): AnyAuthProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new ProviderNotFoundError({ providerId: id });
    }
    return provider;
  }

  getAllOAuthProviders() {
    return Array.from(this.providers.values()).filter(
      (provider) => provider.type === 'oauth',
    );
  }

  getCredentialProvider() {
    return Array.from(this.providers.values()).find(
      (provider) => provider.type === 'credential',
    );
  }
}
