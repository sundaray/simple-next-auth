import type { AuthConfig } from '../../types';
import type { CredentialProvider } from '../../providers/types';
import { ResultAsync } from 'neverthrow';
import {
  SignUpError,
  SignInError,
  VerifyEmailError,
} from '../../providers/credential/errors';

export class CredentialService {
  constructor(private config: AuthConfig) {}

  // --------------------------------------------
  // Sign up with credentials
  // --------------------------------------------
  signUp(
    provider: CredentialProvider,
    data: { email: string; password: string; [key: string]: unknown },
  ): ResultAsync<{ success: boolean }, SignUpError> {
    return ResultAsync.fromPromise(
      (async () => {
        const result = await provider.signUp(data);

        if (result.isErr()) {
          throw new SignUpError({
            cause: result.error,
          });
        }

        return { success: true };
      })(),
      (error) => {
        if (error instanceof SignUpError) {
          return error;
        }
        return new SignUpError({
          message: 'Unexpected error during sign up.',
          cause: error,
        });
      },
    );
  }

  // --------------------------------------------
  // Sign in with credentials
  // --------------------------------------------
  signIn(
    provider: CredentialProvider,
    data: { email: string; password: string },
  ): ResultAsync<
    { sessionData: Record<string, unknown>; redirectTo: `/${string}` },
    SignInError
  > {
    return ResultAsync.fromPromise(
      (async () => {
        const result = await provider.signIn(data);

        if (result.isErr()) {
          throw new SignInError({
            cause: result.error,
          });
        }

        const user = result.value;

        const { hashedPassword, ...sessionData } = user as any;

        return {
          sessionData,
          redirectTo: '/',
        };
      })(),
      (error) => {
        if (error instanceof SignInError) {
          return error;
        }
        return new SignInError({
          message: 'Unexpected error during sign in.',
          cause: error,
        });
      },
    );
  }

  // --------------------------------------------
  // Verify email
  // --------------------------------------------
  verifyEmail(
    request: Request,
    provider: CredentialProvider,
  ): ResultAsync<
    { success: boolean; redirectTo: `/${string}` },
    VerifyEmailError
  > {
    return ResultAsync.fromPromise(
      (async () => {
        // Extract token from URL
        const url = new URL(request.url);
        const token = url.searchParams.get('token');

        // Missing token - redirect to error URL
        if (!token) {
          const errorUrl = provider.config.emailVerification.onError;
          return {
            success: false,
            redirectTo: errorUrl,
          };
        }

        // Verify token via provider
        const result = await provider.verifyEmail(token);

        // Verification failed - redirect to error URL
        if (result.isErr()) {
          const errorUrl = provider.config.emailVerification.onError;
          return {
            success: false,
            redirectTo: errorUrl,
          };
        }

        // Verification succeeded - redirect to success URL
        const successUrl = provider.config.emailVerification.onSuccess;
        return {
          success: true,
          redirectTo: successUrl,
        };
      })(),
      (error) => {
        return new VerifyEmailError({
          message: 'Unexpected error during email verification.',
          cause: error,
        });
      },
    );
  }
}
