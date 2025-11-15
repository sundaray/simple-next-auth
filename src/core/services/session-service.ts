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

export class SessionService<TContext> {
  constructor(
    private config: AuthConfig,
    private userSessionStorage: SessionStorage<TContext>,
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
    context: TContext,
  ): ResultAsync<UserSessionPayload | null, GetSessionError> {
    return this.userSessionStorage
      .getSession(context)
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
  deleteSession(context: TContext): ResultAsync<void, DeleteSessionError> {
    return this.userSessionStorage.deleteSession(context).mapErr((error) => {
      return new DeleteSessionError({
        cause: error,
      });
    });
  }
}
