import { z } from 'zod';

// ============================================
// SESSION CONFIG SCHEMA
// ============================================

/**
 * Session configuration schema.
 */
export const SessionConfigSchema = z.object({
  /**
   * Secret key for encrypting session JWTs.
   * Must be at least 32 characters for security.
   *
   * @example process.env.SESSION_SECRET
   */
  secret: z.string().min(32, 'Session secret must be at least 32 characters'),

  /**
   * Session lifetime in seconds.
   * Default: 7 days (604800 seconds)
   *
   * @example 60 * 60 * 24 * 7  // 7 days
   */
  maxAge: z
    .number()
    .int()
    .positive()
    .default(60 * 60 * 24 * 7),
});

export type SessionConfig = z.infer<typeof SessionConfigSchema>;

// ============================================
// GOOGLE PROVIDER CONFIG SCHEMA
// ============================================

/**
 * Google OAuth provider configuration schema.
 */
export const GoogleProviderConfigSchema = z.object({
  /**
   * Google OAuth Client ID.
   * Get this from Google Cloud Console.
   *
   * @example process.env.GOOGLE_CLIENT_ID
   */
  clientId: z.string().min(1, 'Google Client ID is required'),

  /**
   * Google OAuth Client Secret.
   * Get this from Google Cloud Console.
   *
   * @example process.env.GOOGLE_CLIENT_SECRET
   */
  clientSecret: z.string().min(1, 'Google Client Secret is required'),

  /**
   * OAuth redirect URI.
   * Must match the redirect URI configured in Google Cloud Console.
   *
   * @example 'http://localhost:3000/api/auth/callback/google'
   */
  redirectUri: z.string().url('Redirect URI must be a valid URL'),

  /**
   * OAuth scopes to request.
   * Default: ['openid', 'email', 'profile']
   *
   * Available scopes:
   * - 'openid' - Required for OpenID Connect
   * - 'email' - User's email address
   * - 'profile' - User's basic profile info (name, picture)
   *
   * @see https://developers.google.com/identity/protocols/oauth2/scopes
   */
  scopes: z.array(z.string()).default(['openid', 'email', 'profile']),
});

export type GoogleProviderConfig = z.infer<typeof GoogleProviderConfigSchema>;

// ============================================
// PROVIDERS CONFIG SCHEMA
// ============================================

/**
 * OAuth providers configuration schema.
 * Currently supports: Google
 */
export const ProvidersConfigSchema = z.object({
  /**
   * Google OAuth provider configuration.
   * Optional - only include if you want to enable Google sign-in.
   */
  google: GoogleProviderConfigSchema.optional(),
});

export type ProvidersConfig = z.infer<typeof ProvidersConfigSchema>;

// ============================================
// MAIN AUTH CONFIG SCHEMA
// ============================================

/**
 * Main authentication configuration schema.
 */
export const AuthConfigSchema = z.object({
  /**
   * Session configuration.
   */
  session: SessionConfigSchema,

  /**
   * OAuth providers configuration.
   */
  providers: ProvidersConfigSchema,
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

// ============================================
// CONFIG VALIDATION
// ============================================

/**
 * Validates authentication configuration.
 *
 * @param config - Raw configuration object
 * @returns Validated and typed configuration
 * @throws {Error} If configuration is invalid
 */
export function validateAuthConfig(config: unknown): AuthConfig {
  try {
    return AuthConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('\n');

      throw new Error(`Invalid authentication configuration:\n${issues}`);
    }
    throw error;
  }
}
