import type { Result } from 'neverthrow';
import type { AuthError } from './errors';
import type { OAuthStatePayload } from '../core/oauth/types';
import type { ProviderUser } from '../core/oauth/types';
import type { AuthProviderId } from '../types';

/**
 * This is the raw user profile returned by a provider.
 * The onSignIn callback will receive this.
 */

export interface OAuthProvider {
  id: AuthProviderId;
  type: 'oauth';
  getAuthorizationUrl(params: {
    state: string;
    codeChallenge: string;
    prompt?: string;
  }): Result<string, AuthError>;
  handleCallback(
    request: Request,
    oauthStatePayload: OAuthStatePayload,
  ): Promise<Result<ProviderUser, AuthError>>;
}

export type AnyAuthProvider = OAuthProvider;
