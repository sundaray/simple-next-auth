import { ResultAsync } from 'neverthrow';
import {
  OnSignInCallbackError,
  CreateUserSessionPayloadError,
} from '../errors';
import type { AuthProviderId, AuthConfig } from '../../types';
import type { UserSessionPayload } from './index';

interface CreateUserSessionPayloadParams {
  authConfig: AuthConfig;
  providerName: AuthProviderId;
  providerUserClaims: UserSessionPayload;
}

export function createUserSessionPayload(
  params: CreateUserSessionPayloadParams,
): ResultAsync<UserSessionPayload, CreateUserSessionPayloadError> {
  const { authConfig, providerName, providerUserClaims } = params;

  return ResultAsync.fromPromise(
    (async () => {
      const coreUserSessionPayload = {
        createdAt: Date.now(),
        expiresAt: Date.now() + authConfig.session.maxAge * 1000,
        maxAge: authConfig.session.maxAge,
        provider: providerName,
      };

      let customUserSessionPayload: Record<string, any> = {};
      if (authConfig.callbacks?.onSignIn) {
        try {
          customUserSessionPayload =
            await authConfig.callbacks.onSignIn(providerUserClaims);
        } catch (error) {
          throw new OnSignInCallbackError({ cause: error });
        }
      }

      return {
        ...coreUserSessionPayload,
        ...customUserSessionPayload,
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
