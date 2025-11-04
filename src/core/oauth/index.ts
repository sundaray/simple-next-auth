// ============================================
// OAUTH UTILITIES - BARREL EXPORT
// ============================================

export { createAuthorizationUrl } from './create-authorization-url.js';
export { createOAuthStateJWE } from './create-oauth-state-jwe.js';
export { decryptOAuthStateJWT } from './decrypt-oauth-state-jwe.js';
export { exchangeAuthorizationCodeForTokens } from './exchange-authorization-code-for-tokens.js';
export { decodeIdToken } from './decode-id-token.js';

export type { AuthorizationUrlParams } from './create-authorization-url.js';

export type {
  OAuthStatePayload,
  CreateOAuthStateJWEParams,
} from './create-oauth-state-jwe.js';

export type {
  DecryptOAuthStateJWTParams,
  OAuthStateJWTDecryptionError,
} from './decrypt-oauth-state-jwe.js';

export type {
  GoogleTokenResponse,
  ExchangeCodeForTokensParams,
} from './exchange-authorization-code-for-tokens.js';

export type {
  GoogleIdTokenPayload,
  DecodeIdTokenError,
} from './decode-id-token.js';
