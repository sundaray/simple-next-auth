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

export class DeleteSessionError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to delete session.',
      cause: options.cause,
    });
    this.name = 'DeleteSessionError';
  }
}
