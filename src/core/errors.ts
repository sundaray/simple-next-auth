export class AuthError extends Error {
  constructor(options: { message: string; cause?: unknown }) {
    super(options.message, { cause: options.cause });
    this.name = 'AuthError';
  }
}

export class SignOutError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to sign out.',
      cause: options.cause,
    });
    this.name = 'SignOutError';
  }
}

export class HandleVerifyEmailError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to handle email verification.',
      cause: options.cause,
    });
    this.name = 'HandleVerifyEmailError';
  }
}

export class HandleOAuthCallbackError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to handle OAuth callback.',
      cause: options.cause,
    });
    this.name = 'HandleOAuthCallbackError';
  }
}

export class SignUpError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Sign up failed.',
      cause: options.cause,
    });
    this.name = 'SignUpError';
  }
}

export class SignInError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Sign in failed.',
      cause: options.cause,
    });
    this.name = 'SignInError';
  }
}
