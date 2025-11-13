import { AuthError } from '../errors';

export class MissingAuthorizationCodeError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Missing authorization code in URL.',
      cause: options.cause,
    });
    this.name = 'MissingAuthorizationCodeError';
  }
}

export class MissingStateError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Missing state in URL.',
      cause: options.cause,
    });
    this.name = 'MissingStateError';
  }
}

export class MissingOAuthStateCookieError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'OAuth state cookie not found',
      cause: options.cause,
    });
    this.name = 'MissingOAuthStateCookieError';
  }
}

export class StateMismatchError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'State parameter mismatch.',
      cause: options.cause,
    });
    this.name = 'StateMismatchError';
  }
}

export class InvalidTokenPayloadError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Invalid token payload.',
      cause: options.cause,
    });
    this.name = 'InvalidTokenPayloadError';
  }
}

export class EncryptOAuthStatePayloadError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to encrypt OAuth state payload.',
      cause: options.cause,
    });
    this.name = 'EncryptOAuthStatePayloadError';
  }
}

export class CreateAuthorizationUrlError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to create authorization URL.',
      cause: options.cause,
    });
    this.name = 'CreateAuthorizationUrlError';
  }
}

export class DecryptOAuthStateJweError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to decrypt OAuth state JWE',
      cause: options.cause,
    });
    this.name = 'DecryptOAuthStateJweError';
  }
}

export class ProviderNotFoundError extends AuthError {
  constructor(options: { providerId: string; cause?: unknown }) {
    super({
      message: `'${options.providerId}' provider was not found.`,
      cause: options.cause,
    });
    this.name = 'ProviderNotFoundError';
  }
}
