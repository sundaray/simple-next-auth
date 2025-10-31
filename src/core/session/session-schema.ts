import { z } from 'zod';

export const SessionSchema = z.object({
  createdAt: z.number(),
  expiresAt: z.number(),
  secret: z.string(),
  maxAge: z.number(),
  provider: z.enum(['google', 'credentials']),
  sub: z.string().min(1).optional(),
  email: z.email().optional(),
  emailVerified: z.boolean().optional(),
  name: z.string().optional(),
  picture: z.url().optional(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
});

export type SessionData = z.infer<typeof SessionSchema>;
