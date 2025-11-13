import { AuthError } from '../errors.js';

export class GenerateEmailVerificationTokenError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message:
        options.message || 'Failed to generate email verification token.',
      cause: options.cause,
    });
    this.name = 'GenerateEmailVerificationTokenError';
  }
}

export class VerifyEmailVerificationTokenError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to verify email verification token.',
      cause: options.cause,
    });
    this.name = 'VerifyEmailVerificationTokenError';
  }
}

export class ExpiredEmailVerificationTokenError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Email verification token has expired.',
      cause: options.cause,
    });
    this.name = 'ExpiredEmailVerificationTokenError';
  }
}

export class InvalidEmailVerificationTokenError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Invalid email verification token.',
      cause: options.cause,
    });
    this.name = 'InvalidEmailVerificationTokenError';
  }
}
