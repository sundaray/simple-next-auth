import type {
  AuthProviderId,
  AnyAuthProvider,
  CredentialProvider,
} from '../../providers/types';

import { ProviderNotFoundError } from './errors';
import { Result, ok, err } from 'neverthrow';

export class ProviderRegistry {
  private providers: Map<AuthProviderId, AnyAuthProvider>;

  constructor(providers: AnyAuthProvider[]) {
    this.providers = new Map(
      providers.map((provider) => [provider.id, provider]),
    );
  }

  get(id: AuthProviderId): Result<AnyAuthProvider, ProviderNotFoundError> {
    const provider = this.providers.get(id);
    if (!provider) {
      return err(new ProviderNotFoundError({ providerId: id }));
    }
    return ok(provider);
  }

  getAllOAuthProviders() {
    return Array.from(this.providers.values()).filter(
      (provider) => provider.type === 'oauth',
    );
  }

  getCredentialProvider(): Result<CredentialProvider, ProviderNotFoundError> {
    const provider = Array.from(this.providers.values()).find(
      (provider) => provider.type === 'credential',
    );

    if (!provider) {
      return err(new ProviderNotFoundError({ providerId: 'credential' }));
    }
    return ok(provider);
  }
}
