import { AuthError } from '../errors';

export class InitiateSignInError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to initiate OAuth sign-in.',
      cause: options.cause,
    });
    this.name = 'InitiateSignInError';
  }
}

export class CompleteSignInError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to complete OAuth sign-in.',
      cause: options.cause,
    });
    this.name = 'CompleteSignInError';
  }
}
