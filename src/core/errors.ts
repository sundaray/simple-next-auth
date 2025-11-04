export class AuthError extends Error {
  constructor(options: { message: string; cause?: unknown }) {
    super(options.message, { cause: options.cause });
    this.name = 'AuthError';
  }
}

export class MissingAuthorizationCodeError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Missing authorization code in callback URL.',
      cause: options.cause,
    });
    this.name = 'MissingAuthorizationCodeError';
  }
}

export class MissingStateError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Missing state in callback URL.',
      cause: options.cause,
    });
    this.name = 'MissingStateError';
  }
}

export class SetCookieError extends AuthError {
  constructor(options: { message?: string; cause?: unknown }) {
    super({
      message: options.message || 'Failed to set cookie.',
      cause: options.cause,
    });
    this.name = 'SetCookieError';
  }
}

export class GetCookieError extends AuthError {
  constructor(options: { message?: string; cause?: unknown }) {
    super({
      message: options.message || 'Failed to get cookie.',
      cause: options.cause,
    });
    this.name = 'GetCookieError';
  }
}

export class DeleteCookieError extends AuthError {
  constructor(options: { message?: string; cause?: unknown }) {
    super({
      message: options.message || 'Failed to delete cookie.',
      cause: options.cause,
    });
    this.name = 'DeleteCookieError';
  }
}

export class EncodeClientCredentialsError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to encode client credentials',
      cause: options.cause,
    });
    this.name = 'EncodeClientCredentialsError';
  }
}

export class TokenFetchError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to fetch tokens from provider',
      cause: options.cause,
    });
    this.name = 'TokenFetchError';
  }
}

export class TokenResponseError extends AuthError {
  public status?: number;
  public statusText?: string;

  constructor(
    options: {
      message?: string;
      cause?: unknown;
      status?: number;
      statusText?: string;
    } = {},
  ) {
    super({
      message: options.message || 'Token endpoint returned an error response',
      cause: options.cause,
    });
    this.name = 'TokenResponseError';
    this.status = options.status;
    this.statusText = options.statusText;
  }
}

export class TokenParseError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to parse token response',
      cause: options.cause,
    });
    this.name = 'TokenParseError';
  }
}

export class InvalidTokenPayloadError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Invalid token payload',
      cause: options.cause,
    });
    this.name = 'InvalidTokenPayloadError';
  }
}
