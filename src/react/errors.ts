import { AuthError } from '../core/errors';

export class FetchUserSessionError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to fetch user session',
      cause: options.cause,
    });
    this.name = 'FetchUserSessionError';
  }
}

export class MissingUserSessionProviderError extends AuthError {
  constructor(options: { message?: string } = {}) {
    super({
      message:
        options.message ||
        'useUserSession must be used within a UserSessionProvider.',
    });
    this.name = 'MissingUserSessionProviderError';
  }
}
