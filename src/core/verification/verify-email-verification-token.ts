import { jwtVerify } from 'jose';
import { ResultAsync } from 'neverthrow';
import { Buffer } from 'node:buffer';
import { VerifyEmailVerificationTokenError } from './errors';

interface EmailVerificationPayload {
  email: string;
}

export function verifyEmailVerificationToken(
  token: string,
  secret: string,
): ResultAsync<string, VerifyEmailVerificationTokenError> {
  return ResultAsync.fromPromise(
    (async () => {
      const secretKey = Buffer.from(secret, 'base64');

      const { payload } = await jwtVerify<EmailVerificationPayload>(
        token,
        secretKey,
      );

      return payload.email;
    })(),
    (error) => new VerifyEmailVerificationTokenError({ cause: error }),
  );
}
