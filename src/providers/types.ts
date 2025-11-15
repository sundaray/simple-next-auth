import type { AuthError } from '../core/errors';
import type {
  SignUpError,
  SignInError,
  AccountNotFoundError,
  InvalidCredentialsError,
  VerifyEmailError,
} from './credential/errors';
import { Result, ResultAsync } from 'neverthrow';
import type { OAuthStatePayload } from '../core/oauth/types';
import type { User, CredentialProviderConfig } from './credential/types';

export type AuthProviderId = 'google' | 'credential';

/**
 * Contract for OAuth providers (Google, GitHub, etc.)
 * Not user-facing - implemented by provider classes
 */
export interface OAuthProvider {
  id: AuthProviderId;
  type: 'oauth';
  getAuthorizationUrl(params: {
    state: string;
    codeChallenge: string;
    prompt?: string;
  }): Result<string, AuthError>;
  completeSignin(
    request: Request,
    oauthStatePayload: OAuthStatePayload,
  ): ResultAsync<Record<string, any>, AuthError>;

  onAuthenticated(
    userClaims: Record<string, any>,
  ): ResultAsync<Record<string, unknown>, AuthError>;
}

/**
 * Contract for credential (email/password) provider
 * Not user-facing - implemented by CredentialProvider class
 */
export interface CredentialProvider {
  id: 'credential';
  type: 'credential';
  config: CredentialProviderConfig;
  signUp(data: {
    email: string;
    password: string;
    [key: string]: unknown;
  }): ResultAsync<User, SignUpError>;
  signIn(data: {
    email: string;
    password: string;
  }): ResultAsync<
    User,
    AccountNotFoundError | InvalidCredentialsError | SignInError
  >;
  verifyEmail(token: string): ResultAsync<{ email: string }, VerifyEmailError>;
}

export type AnyAuthProvider = OAuthProvider | CredentialProvider;
