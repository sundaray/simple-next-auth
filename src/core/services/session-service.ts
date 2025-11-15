import type { AuthConfig } from '../../types';
import type { SessionStorage, UserSessionPayload } from '../session/types';
import {
  encryptUserSessionPayload,
  decryptUserSessionJWE,
  createUserSessionPayload,
} from '../session';
import type { AuthProviderId } from '../../providers/types';
import { ResultAsync } from 'neverthrow';
import {
  CreateSessionError,
  GetSessionError,
  DeleteSessionError,
} from './errors';

export class SessionService {
  constructor(
    private config: AuthConfig,
    private userSessionStorage: SessionStorage<any, any>,
  ) {}

  // --------------------------------------------
  // Create session
  // --------------------------------------------
  createSession(
    sessionData: Record<string, unknown>,
    providerId: AuthProviderId,
  ): ResultAsync<string, CreateSessionError> {
    return ResultAsync.fromPromise(
      (async () => {
        const sessionPayloadResult = await createUserSessionPayload({
          authConfig: this.config,
          providerName: providerId,
          userClaims: sessionData,
        });
        if (sessionPayloadResult.isErr()) {
          throw new CreateSessionError({
            cause: sessionPayloadResult.error,
          });
        }

        const sessionJWEResult = await encryptUserSessionPayload({
          userSessionPayload: sessionPayloadResult.value,
          secret: this.config.session.secret,
          maxAge: this.config.session.maxAge,
        });
        if (sessionJWEResult.isErr()) {
          throw new CreateSessionError({
            cause: sessionJWEResult.error,
          });
        }

        return sessionJWEResult.value;
      })(),
      (error) => {
        if (error instanceof CreateSessionError) {
          return error;
        }
        return new CreateSessionError({
          message: 'Unexpected error creating session.',
          cause: error,
        });
      },
    );
  }

  // --------------------------------------------
  // Get session
  // --------------------------------------------
  getSession(
    request: Request,
  ): ResultAsync<UserSessionPayload | null, GetSessionError> {
    return ResultAsync.fromPromise(
      (async () => {
        const jwe = await this.userSessionStorage.getSession(request);
        if (!jwe) return null;

        const sessionResult = await decryptUserSessionJWE({
          jwe,
          secret: this.config.session.secret,
        });

        if (sessionResult.isErr()) {
          throw new GetSessionError({
            cause: sessionResult.error,
          });
        }

        return sessionResult.value;
      })(),
      (error) => {
        if (error instanceof GetSessionError) {
          return error;
        }
        return new GetSessionError({
          message: 'Unexpected error getting session.',
          cause: error,
        });
      },
    );
  }

  // --------------------------------------------
  // Delete session
  // --------------------------------------------
  deleteSession(): ResultAsync<void, DeleteSessionError> {
    return ResultAsync.fromPromise(
      (async () => {
        await this.userSessionStorage.deleteSession(undefined);
      })(),
      (error) => {
        return new DeleteSessionError({
          message: 'Unexpected error deleting session.',
          cause: error,
        });
      },
    );
  }
}
