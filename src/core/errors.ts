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
      message:
        options.message ||
        'State parameter mismatch - possible CSRF attack detected',
      cause: options.cause,
    });
    this.name = 'StateMismatchError';
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

export class GenerateStateError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to generate state parameter',
      cause: options.cause,
    });
    this.name = 'GenerateStateError';
  }
}

export class GenerateCodeVerifierError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to generate PKCE code verifier',
      cause: options.cause,
    });
    this.name = 'GenerateCodeVerifierError';
  }
}

export class GenerateCodeChallengeError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to generate PKCE code challenge',
      cause: options.cause,
    });
    this.name = 'GenerateCodeChallengeError';
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

export class EncryptUserSessionPayloadError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to encrypt user session payload.',
      cause: options.cause,
    });
    this.name = 'EncryptUserSessionPayloadError';
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
export class DecryptUserSessionJweError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to decrypt user session JWE.',
      cause: options.cause,
    });
    this.name = 'DecryptUserSessionJweError';
  }
}
