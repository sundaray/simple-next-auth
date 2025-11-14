import type { Result } from 'neverthrow';
import type { AuthError } from '../core/errors';
import type {
  SignUpError,
  SignInError,
  AccountNotFoundError,
  InvalidCredentialsError,
  VerifyEmailError,
} from './credential/errors';
import { ResultAsync } from 'neverthrow';
import type { OAuthStatePayload } from '../core/oauth/types';
import type { ProviderUser } from '../core/oauth/types';
import type { AuthProviderId } from '../types';
import type { User } from './credential/types';

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

export interface CredentialProvider {
  id: 'credential';
  type: 'credential';
  config: CredentialConfig;
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
