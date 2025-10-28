import { EncryptJWT } from 'jose';
import { ResultAsync } from 'neverthrow';

// ============================================
// ERROR TYPES
// ============================================

export type SessionJWTCreationError = {
  type: 'SESSION_JWT_CREATION_ERROR';
  message: string;
  cause?: unknown;
};

// ============================================
// SESSION DATA TYPES (DISCRIMINATED UNION)
// ============================================

interface BaseSessionData {
  createdAt: number;
  expiresAt: number;
}

export interface GoogleSessionData extends BaseSessionData {
  provider: 'google';
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export interface CredentialsSessionData extends BaseSessionData {
  provider: 'credentials';
  email: string;
  emailVerified: boolean;
  userId: string;
}

export type SessionData = GoogleSessionData | CredentialsSessionData;

// ============================================
// TYPES
// ============================================

export interface CreateSessionJWTParams {
  sessionData: SessionData;
  secret: string;
  maxAge: number;
}

// ============================================
// CREATE SESSION JWT
// ============================================

/**
 * Creates an encrypted JWT (JWE) containing session data.
 */
export function createSessionJWT(
  params: CreateSessionJWTParams,
): ResultAsync<string, SessionJWTCreationError> {
  return ResultAsync.fromPromise(
    (async () => {
      const { sessionData, secret, maxAge } = params;

      // Convert secret string to Uint8Array (required by jose)
      const secretKey = new TextEncoder().encode(secret);

      // Create encrypted JWT
      const jwt = await new EncryptJWT({ session: sessionData })
        .setProtectedHeader({ alg: 'dir', enc: 'A256CBC-HS512' })
        .setIssuedAt()
        .setExpirationTime(`${maxAge}s`)
        .encrypt(secretKey);

      return jwt;
    })(),
    (error): SessionJWTCreationError => ({
      type: 'SESSION_JWT_CREATION_ERROR',
      message: 'Failed to create session JWT',
      cause: error,
    }),
  );
}
