export class AuthError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'AuthError';
    this.cause = cause;
  }
}

export class MissingAuthorizationCodeError extends AuthError {
  constructor(
    message = 'Missing authorization code in callback URL.',
    cause?: unknown,
  ) {
    super(message, cause);
    this.name = 'MissingAuthorizationCodeError';
  }
}

export class MissingStateError extends AuthError {
  constructor(message = 'Missing state in callback URL.', cause?: unknown) {
    super(message, cause);
    this.name = 'MissingStateError';
  }
}
