import { ResultAsync } from 'neverthrow';
import type { CredentialProvider as CredentialProviderType } from '../types';
import { hashPassword } from '../../core/password/hash';
import { verifyPassword } from '../../core/password/verify';
import { generateEmailVerificationToken } from '../../core/verification/generate-email-verification-token';
import { verifyEmailVerificationToken } from '../../core/verification/verify-email-verification-token';
import { buildEmailVerificationUrl } from '../../core/verification/build-email-verification-url';
import {
  SignUpError,
  SignInError,
  AccountNotFoundError,
  InvalidCredentialsError,
  VerifyEmailError,
} from './errors';

import type { User } from './types';

export class CredentialProvider implements CredentialProviderType {
  id = 'credential' as const;
  type = 'credential' as const;

  constructor(config) {}

  signUp(data): ResultAsync<User, SignUpError> {
    return ResultAsync.fromPromise(
      (async () => {
        const { email, password, ...additionalFields } = data;

        const hashResult = await hashPassword(password);
        if (hashResult.isErr()) {
          throw new SignUpError({ cause: hashResult.error });
        }

        const user = await this.config.onSignUp({
          email,
          hashedPassword: hashResult.value,
          ...additionalFields,
        });

        const tokenResult = await generateEmailVerificationToken({
          email,
          secret: this.config.secret,
        });
        if (tokenResult.isErr()) {
          throw new SignUpError({ cause: tokenResult.error });
        }

        const verificationurl = await buildEmailVerificationUrl(
          this.config.baseUrl,
          tokenResult.value,
          this.config.emailVerification.path,
        );

        await this.config.emailVerification.sendVerificationEmail({
          email,
          url: verificationurl,
        });

        return user;
      })(),
      (error) => {
        if (error instanceof SignUpError) return error;
        return new SignUpError({ cause: error });
      },
    );
  }

  signIn(data: {
    email: string;
    password: string;
  }): ResultAsync<
    User,
    SignInError | AccountNotFoundError | InvalidCredentialsError
  > {
    return ResultAsync.fromPromise(
      (async () => {
        const { email, password } = data;

        // Execure user's onSignIn callback
        const userFromDb = await this.config.onSignIn({ email });

        if (!userFromDb) {
          throw new AccountNotFoundError();
        }

        // Verify password
        const verifyPasswordResult = await verifyPassword(
          password,
          userFromDb.hashedPassword,
        );

        if (verifyPasswordResult.isErr()) {
          throw new SignInError({ cause: verifyPasswordResult.error });
        }

        const isPasswordValid = verifyPasswordResult.value;

        if (!isPasswordValid) {
          throw new InvalidCredentialsError();
        }

        return userFromDb;
      })(),
      (error) => {
        if (
          error instanceof SignInError ||
          error instanceof AccountNotFoundError ||
          error instanceof InvalidCredentialsError
        ) {
          return error;
        }

        return new SignInError({ cause: error });
      },
    );
  }

  verifyEmail(token: string): ResultAsync<User, VerifyEmailError> {
    return ResultAsync.fromPromise(
      (async () => {
        const emailResult = await verifyEmailVerificationToken(
          token,
          this.config.secret,
        );

        if (emailResult.isError()) {
          throw new VerifyEmailError({ cause: emailResult.error });
        }

        const email = emailResult.value;

        await this.config.emailVerification.onEmailVerified({ email });

        return { email };
      })(),
      (error) => {
        if (error instanceof VerifyEmailError) return error;
        return new VerifyEmailError({ cause: error });
      },
    );
  }
}
