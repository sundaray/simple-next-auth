import { decryptUserSessionJWE, encryptUserSessionPayload } from './session';
import type { AuthConfig } from '../config/schema';

export async function extendUserSessionExpiry(
  userSessionJWE: string,
  config: AuthConfig,
) {
  const userSessionPayloadResult = await decryptUserSessionJWE({
    jwe: userSessionJWE,
    secret: config.session.secret,
  });

  if (userSessionPayloadResult.isErr()) {
    return null;
  }

  const userSessionPayload = userSessionPayloadResult.value;

  const newUserSessionJWEResult = await encryptUserSessionPayload({
    payload: userSessionPayload,
    secret: config.session.secret,
    maxAge: config.session.maxAge,
  });

  if (newUserSessionJWEResult.isErr()) {
    return null;
  }

  const newUserSessionJWE = newUserSessionJWEResult.value;

  return newUserSessionJWE;
}
