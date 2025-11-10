import { AuthError } from '../errors';

export class GenerateStateError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to generate state.',
      cause: options.cause,
    });
    this.name = 'GenerateStateError';
  }
}

export class GenerateCodeVerifierError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to generate code verifier.',
      cause: options.cause,
    });
    this.name = 'GenerateCodeVerifierError';
  }
}

export class GenerateCodeChallengeError extends AuthError {
  constructor(options: { message?: string; cause?: unknown } = {}) {
    super({
      message: options.message || 'Failed to generate code challenge.',
      cause: options.cause,
    });
    this.name = 'GenerateCodeChallengeError';
  }
}
