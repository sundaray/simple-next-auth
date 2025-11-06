import type { AnyAuthProvider } from '../strategy';
import type { OAuthSignInResult } from '../../types';
import { ResultAsync } from 'neverthrow';
import { RunOAuthProviderSignInCallbackError } from '../errors';

export interface RunOAuthProviderSignInCallbackParams {
  authProvider: AnyAuthProvider;
  request: Request;
}

export function runOAuthProviderSignInCallback(
  params: RunOAuthProviderSignInCallbackParams,
): ResultAsync<OAuthSignInResult, RunOAuthProviderSignInCallbackError> {
  const { authProvider, request } = params;

  return ResultAsync.fromPromise(
    authProvider.handleCallback(request),
    (error) => new RunOAuthProviderSignInCallbackError({ cause: error }),
  );
}
