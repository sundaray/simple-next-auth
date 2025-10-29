import { z } from 'zod';

// ============================================
// ZOD SCHEMAS (DISCRIMINATED UNION)
// ============================================

/**
 * Base schema shared by all session types
 */
const BaseSessionSchema = z.object({
  createdAt: z.number(),
  expiresAt: z.number(),
});

/**
 * Google OAuth session schema
 *
 * Note: email, name, and picture are optional because they depend on
 * the scopes requested by the user:
 * - 'email' scope → email, email_verified
 * - 'profile' scope → name, picture, given_name, family_name
 */
export const GoogleSessionSchema = BaseSessionSchema.extend({
  provider: z.literal('google'),
  sub: z.string().min(1), // ✅ Always present (Google user ID)

  // Optional - depends on 'email' scope
  email: z.string().email().optional(),
  emailVerified: z.boolean().optional(),

  // Optional - depends on 'profile' scope
  name: z.string().optional(),
  picture: z.string().url().optional(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
});

/**
 * Email/Password credentials session schema
 */
export const CredentialsSessionSchema = BaseSessionSchema.extend({
  provider: z.literal('credentials'),
  email: z.string().email(), // ✅ Always present for credentials
  emailVerified: z.boolean(), // ✅ Always present for credentials
  userId: z.string().min(1), // ✅ User's database ID
});

/**
 * Discriminated union of all session types
 */
export const SessionDataSchema = z.discriminatedUnion('provider', [
  GoogleSessionSchema,
  CredentialsSessionSchema,
]);

// ============================================
// INFERRED TYPESCRIPT TYPES
// ============================================

export type GoogleSessionData = z.infer<typeof GoogleSessionSchema>;
export type CredentialsSessionData = z.infer<typeof CredentialsSessionSchema>;
export type SessionData = z.infer<typeof SessionDataSchema>;
