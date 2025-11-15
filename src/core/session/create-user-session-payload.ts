import { ResultAsync, okAsync } from 'neverthrow';
import type { AuthConfig } from '../../types';
import type { AuthProviderId } from '../../providers/types';
import type { UserSessionPayload } from './index';

interface CreateUserSessionPayloadParams {
  authConfig: AuthConfig;
  providerName: AuthProviderId;
  userClaims: Record<string, any>;
}

export function createUserSessionPayload(
  params: CreateUserSessionPayloadParams,
): ResultAsync<UserSessionPayload, never> {
  const { authConfig, providerName, userClaims } = params;

  return okAsync({
    maxAge: authConfig.session.maxAge,
    provider: providerName,
    ...userClaims,
  });
}
