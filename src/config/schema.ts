import { z } from 'zod';

// ============================================
// SESSION CONFIG SCHEMA
// ============================================

export const SessionConfigSchema = z.object({
  /**
   * Secret key for encrypting session JWTs.
   * Must be at least 32 characters for security.
   */
  secret: z.string().min(32, 'Session secret must be at least 32 characters'),

  /**
   * Session lifetime in seconds.
   * Default: 7 days (604800 seconds)
   *
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

export const GoogleProviderConfigSchema = z.object({
  clientId: z.string().min(1, 'Google Client ID is required'),
  clientSecret: z.string().min(1, 'Google Client Secret is required'),
  redirectUri: z.url('Redirect URI must be a valid URL'),

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

export const ProvidersConfigSchema = z.object({
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
  session: SessionConfigSchema,
  providers: ProvidersConfigSchema,
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

// ============================================
// CONFIG VALIDATION
// ============================================

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
