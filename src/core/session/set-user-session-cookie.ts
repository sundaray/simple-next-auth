import { ResultAsync } from 'neverthrow';
import type { FrameworkAdapter } from '../../types';
import type { AuthConfig } from '../../types';
import { COOKIE_NAMES } from '../constants';
import { SetUserSessionCookieError } from '../errors';

export interface SetUserSessionCookieParams {
  frameworkAdapter: FrameworkAdapter;
  authConfig: AuthConfig;
  jwe: string;
}

export function setUserSessionCookie(
  params: SetUserSessionCookieParams,
): ResultAsync<void, SetUserSessionCookieError> {
  const { frameworkAdapter, authConfig, jwe } = params;

  return ResultAsync.fromPromise(
    frameworkAdapter.setCookie(COOKIE_NAMES.USER_SESSION, jwe, {
      maxAge: authConfig.session.maxAge,
    }),
    (error) => {
      return new SetUserSessionCookieError({ cause: error });
    },
  );
}
