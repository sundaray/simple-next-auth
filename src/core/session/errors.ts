import { AuthError } from '../errors';

export class DeleteOauthStateCookieError extends AuthError {
  constructor(options: { message?: string; cause?: unknown }) {
    super({
      message: options.message || 'Failed to delete the OAuth state cookie.',
      cause: options.cause,
    });
    this.name = 'DeleteOauthStateCookieError';
  }
}

export class EncryptUserSessionPayloadError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to encrypt user session payload.',
      cause: options.cause,
    });
    this.name = 'EncryptUserSessionPayloadError';
  }
}

export class DecryptUserSessionError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to decrypt user session JWE.',
      cause: options.cause,
    });
    this.name = 'DecryptUserSessionJweError';
  }
}

export class RunOAuthProviderSignInCallbackError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message:
        options.message || 'Failed to run OAuth provider sign-in callback.',
      cause: options.cause,
    });
    this.name = 'RunOAuthProviderSignInCallbackError';
  }
}

export class CreateUserSessionPayloadError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to create user session payload.',
      cause: options.cause,
    });
    this.name = 'CreateUserSessionPayloadError';
  }
}

export class OnSignInCallbackError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'User onSignIn callback failed to execute.',
      cause: options.cause,
    });
    this.name = 'OnSignInCallbackError';
  }
}

export class SetUserSessionCookieError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to set the user session cookie.',
      cause: options.cause,
    });
    this.name = 'SetUserSessionCookieError';
  }
}

export class CreateSessionError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to create session.',
      cause: options.cause,
    });
    this.name = 'CreateSessionError';
  }
}

export class GetSessionError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to get session.',
      cause: options.cause,
    });
    this.name = 'GetSessionError';
  }
}

export class SaveSessionError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to save session.',
      cause: options.cause,
    });
    this.name = 'SaveSessionError';
  }
}

export class DeleteSessionError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to delete session.',
      cause: options.cause,
    });
    this.name = 'DeleteSessionError';
  }
}
