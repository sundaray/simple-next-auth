import type { FrameworkAdapter } from '../../types';
import { COOKIE_NAMES } from '../constants';
import { ResultAsync } from 'neverthrow';
import { DeleteOauthStateCookieError } from '../errors';

interface DeleteOauthStateCookieParams {
  frameworkAdapter: FrameworkAdapter;
}

export function deleteOAuthStateCookie(
  params: DeleteOauthStateCookieParams,
): ResultAsync<void, DeleteOauthStateCookieError> {
  const { frameworkAdapter } = params;

  return ResultAsync.fromPromise(
    frameworkAdapter.deleteCookie(COOKIE_NAMES.OAUTH_STATE),
    (error) => new DeleteOauthStateCookieError({ cause: error }),
  );
}
