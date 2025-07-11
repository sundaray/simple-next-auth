import { z } from "zod";

// --- Form Schemas ---

export const CredentialsSignInFormSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email" })
    .trim(),
  password: z.string({ required_error: "Password is required" }).trim(),
});

export const CredentialsSignUpFormSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email" })
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "contain at least one letter" })
    .regex(/[0-9]/, { message: "contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "contain at least one special character",
    })
    .trim(),
});

export const ForgotPasswordFormSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email" })
    .trim(),
});

export const ResetPasswordFormSchema = z
  .object({
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(8, { message: "be at least 8 characters long" })
      .regex(/[a-zA-Z]/, { message: "contain at least one letter" })
      .regex(/[0-9]/, { message: "contain at least one number" })
      .regex(/[^a-zA-Z0-9]/, {
        message: "contain at least one special character",
      })
      .trim(),
    confirmNewPassword: z.string({
      required_error: "New password is required",
    }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

// --- Session and Token Schemas ---

export const OAuthStateSchema = z.object({
  state: z.string(),
  codeVerifier: z.string(),
  redirect: z.string(),
});

export const UserSessionSchema = z.object({
  email: z.string().email(),
  role: z.string(),
});

export type UserSession = z.infer<typeof UserSessionSchema>;

export const EmailVerificationSessionSchema = z.object({
  email: z.string().email(),
  token: z.string(),
  hashedPassword: z.string(),
});

export const PasswordResetSessionSchema = z.object({
  email: z.string().email(),
  token: z.string(),
});

export const GoogleIDTokenSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  picture: z.string().url({ message: "Invalid URL for picture" }),
});

export const EncryptableSessionSchema = z.union([
  UserSessionSchema,
  EmailVerificationSessionSchema,
  PasswordResetSessionSchema,
  OAuthStateSchema,
]);

export type EncryptableSession = z.infer<typeof EncryptableSessionSchema>;