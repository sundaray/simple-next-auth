import type { AuthConfig } from '../../types';
import type { SessionStorage, UserSessionPayload } from '../session/types';
import {
  encryptUserSessionPayload,
  decryptUserSession,
  createUserSessionPayload,
} from '../session';
import type { AuthProviderId } from '../../providers/types';
import { ResultAsync, okAsync } from 'neverthrow';
import {
  CreateSessionError,
  GetSessionError,
  DeleteSessionError,
} from '../session/errors';

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
    return createUserSessionPayload({
      authConfig: this.config,
      providerName: providerId,
      userClaims: sessionData,
    })
      .andThen((userSessionPayload) =>
        encryptUserSessionPayload({
          userSessionPayload,
          secret: this.config.session.secret,
          maxAge: this.config.session.maxAge,
        }),
      )
      .mapErr((error) => {
        return new CreateSessionError({
          cause: error,
        });
      });
  }

  // --------------------------------------------
  // Get session
  // --------------------------------------------
  getSession(
    request: Request,
  ): ResultAsync<UserSessionPayload | null, GetSessionError> {
    return ResultAsync.fromPromise(
      this.userSessionStorage.getSession(request),
      (error) => new GetSessionError({ cause: error }),
    )
      .andThen((session) => {
        if (!session) {
          return okAsync(null);
        }

        return decryptUserSession({
          session,
          secret: this.config.session.secret,
        });
      })
      .mapErr((error) => {
        if (error instanceof GetSessionError) {
          return error;
        }
        return new GetSessionError({
          cause: error,
        });
      });
  }

  // --------------------------------------------
  // Delete session
  // --------------------------------------------
  deleteSession(): ResultAsync<void, DeleteSessionError> {
    return ResultAsync.fromPromise(
      this.userSessionStorage.deleteSession(undefined),
      (error) => {
        return new DeleteSessionError({
          cause: error,
        });
      },
    );
  }
}
