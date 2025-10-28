// ============================================
// SESSION UTILITIES - BARREL EXPORT
// ============================================

export { createSessionJWT } from './create-session-jwt.js';
export { decryptSessionJWT } from './decrypt-session-jwt.js';

// Export Zod schemas (for validation)
export {
  SessionDataSchema,
  GoogleSessionSchema,
  CredentialsSessionSchema,
} from './session-schema.js';

// Export TypeScript types
export type {
  SessionData,
  GoogleSessionData,
  CredentialsSessionData,
} from './session-schema.js';

export type {
  CreateSessionJWTParams,
  SessionJWTCreationError,
} from './create-session-jwt.js';

export type {
  DecryptSessionJWTParams,
  SessionJWTDecryptionError,
} from './decrypt-session-jwt.js';
