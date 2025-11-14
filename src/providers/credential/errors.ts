import { AuthError } from '../../core/errors.js';

export class SignUpError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    const message =
      options.message ||
      (options.cause instanceof Error
        ? options.cause.message
        : 'Sign up failed');

    super({ message, cause: options.cause });
    this.name = 'SignUpError';
  }
}

export class SignInError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    const message =
      options.message ||
      (options.cause instanceof Error
        ? options.cause.message
        : 'Sign in failed');

    super({ message, cause: options.cause });
    this.name = 'SignInError';
  }
}

export class VerifyEmailError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    const message =
      options.message ||
      (options.cause instanceof Error
        ? options.cause.message
        : 'Email verification failed');

    super({ message, cause: options.cause });
    this.name = 'VerifyEmailError';
  }
}

export class AccountNotFoundError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message:
        options.message || 'No account found with this email. Please sign up.',
      cause: options.cause,
    });
    this.name = 'AccountNotFoundError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Invalid email or password.',
      cause: options.cause,
    });
    this.name = 'InvalidCredentialsError';
  }
}
