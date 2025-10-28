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
 */
export const GoogleSessionSchema = BaseSessionSchema.extend({
  provider: z.literal('google'),
  email: z.email(),
  name: z.string().min(1),
  picture: z.url(),
  sub: z.string().min(1),
});

/**
 * Email/Password credentials session schema
 */
export const CredentialsSessionSchema = BaseSessionSchema.extend({
  provider: z.literal('credentials'),
  email: z.email(),
  emailVerified: z.boolean(),
  userId: z.string().min(1),
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

/**
 * Inferred TypeScript type for Google session
 */
export type GoogleSessionData = z.infer<typeof GoogleSessionSchema>;

/**
 * Inferred TypeScript type for Credentials session
 */
export type CredentialsSessionData = z.infer<typeof CredentialsSessionSchema>;

/**
 * Inferred TypeScript type for all sessions (discriminated union)
 */
export type SessionData = z.infer<typeof SessionDataSchema>;
