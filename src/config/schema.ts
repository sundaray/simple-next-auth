import { z } from 'zod';
import type { GoogleIdTokenPayload } from '../core/oauth/index.js';

// ============================================
//
// AUTH SESSION CONFIG
//
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
   */
  maxAge: z
    .number()
    .int()
    .positive()
    .default(60 * 60 * 24 * 7),
});

export type SessionConfig = z.infer<typeof SessionConfigSchema>;

// ============================================
//
// AUTH PROVIDERS CONFIG
//
// ============================================

export const GoogleProviderConfigSchema = z.object({
  clientId: z.string().min(1, 'Google Client ID is required'),
  clientSecret: z.string().min(1, 'Google Client Secret is required'),
  redirectUri: z.url('Redirect URI must be a valid URL'),
});

export type GoogleProviderConfig = z.infer<typeof GoogleProviderConfigSchema>;

export const ProvidersConfigSchema = z.object({
  google: GoogleProviderConfigSchema.optional(),
});

export type ProvidersConfig = z.infer<typeof ProvidersConfigSchema>;

// ============================================
//
// AUTH CALLBACKS CONFIG
//
// ============================================

export interface AuthCallbacks {
  google?: (profile: GoogleIdTokenPayload) => Promise<Record<string, unknown>>;
}

// export const CallbacksConfigSchema = z.object({
//   google: z.function().optional(),
// });

// ============================================
//
// AUTH CONFIG
//
// ============================================

export const AuthConfigSchema = z.object({
  session: SessionConfigSchema,
  providers: ProvidersConfigSchema.optional(),
  callbacks: z.custom<AuthCallbacks>().optional(),
});

export type AuthConfig = z.infer<typeof AuthConfigSchema> & {
  callbacks?: AuthCallbacks;
};
// ============================================
//
// VALIDATE AUTH CONFIG
//
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
