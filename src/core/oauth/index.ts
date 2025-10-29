// ============================================
// OAUTH UTILITIES - BARREL EXPORT
// ============================================

export { createAuthorizationUrl } from './create-authorization-url.js';
export { createOAuthStateJWT } from './create-oauth-state-jwt.js';
export { decryptOAuthStateJWT } from './decrypt-oauth-state-jwt.js';
export { exchangeCodeForTokens } from './exchange-code-for-tokens.js';
export { decodeIdToken } from './decode-id-token.js';

export type { AuthorizationUrlParams } from './create-authorization-url.js';

export type {
  OAuthStateData,
  CreateOAuthStateJWTParams,
  OAuthStateJWTCreationError,
} from './create-oauth-state-jwt.js';

export type {
  DecryptOAuthStateJWTParams,
  OAuthStateJWTDecryptionError,
} from './decrypt-oauth-state-jwt.js';

export type {
  GoogleTokenResponse,
  ExchangeCodeForTokensParams,
  ExchangeCodeForTokensError,
} from './exchange-code-for-tokens.js';

export type {
  GoogleIdTokenPayload,
  DecodeIdTokenError,
} from './decode-id-token.js';
