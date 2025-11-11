import { ResultAsync } from 'neverthrow';
import { CreateUserSessionPayloadError, OnSignInCallbackError } from './errors';
import type { AuthProviderId, AuthConfig } from '../../types';
import type { UserSessionPayload } from './index';

interface CreateUserSessionPayloadParams {
  authConfig: AuthConfig;
  providerName: AuthProviderId;
  providerUserClaims: Record<string, any>;
}

export function createUserSessionPayload(
  params: CreateUserSessionPayloadParams,
): ResultAsync<UserSessionPayload, CreateUserSessionPayloadError> {
  const { authConfig, providerName, providerUserClaims } = params;

  return ResultAsync.fromPromise(
    (async () => {
      const coreUserSessionPayload = {
        maxAge: authConfig.session.maxAge,
        provider: providerName,
      };

      return {
        ...coreUserSessionPayload,
        ...providerUserClaims,
      };
    })(),
    (error) => {
      if (error instanceof OnSignInCallbackError) {
        new CreateUserSessionPayloadError({
          message:
            'Failed to create user session paylaod. onSignInCallback failed.',
          cause: error,
        });
      }
      return new CreateUserSessionPayloadError({ cause: error });
    },
  );
}
