import { SignJWT, type JWTPayload } from 'jose';
import { ResultAsync } from 'neverthrow';
import { GenerateEmailVerificationTokenError } from './errors';
import { Buffer } from 'node:buffer';
import { EMAIL_VERIFICATION_TOKEN_EXPIRES_IN } from '../constants';

export function generateEmailVerificationToken(params: {
  email: string;
  secret: string;
  expiresIn?: number;
}): ResultAsync<string, GenerateEmailVerificationTokenError> {
  return ResultAsync.fromPromise(
    (async () => {
      const {
        email,
        secret,
        expiresIn = EMAIL_VERIFICATION_TOKEN_EXPIRES_IN,
      } = params;

      // Decode the base64 secret to get the raw bytes
      const secretKey = Buffer.from(secret, 'base64');

      // Create a signed JWT
      const token = await new SignJWT({ email })
        .setProtectedHeader({
          alg: 'HS256',
        })
        .setIssuedAt()
        .setExpirationTime(`${expiresIn}s`)
        .sign(secretKey);

      return token;
    })(),
    (error) => new GenerateEmailVerificationTokenError({ cause: error }),
  );
}
