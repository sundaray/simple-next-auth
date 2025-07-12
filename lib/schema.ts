import { z } from "zod";
import { Schema } from "effect";

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

export const OAuthStateSchema = Schema.Struct({
  state: Schema.String,
  codeVerifier: Schema.String,
  redirect: Schema.String,
});

export const UserSessionSchema = Schema.Struct({
  email: Schema.String,
  role: Schema.String,
});

export type UserSession = Schema.Schema.Type<typeof UserSessionSchema>;

export const EmailVerificationSessionSchema = Schema.Struct({
  email: Schema.String,
  token: Schema.String,
  hashedPassword: Schema.String,
});

export const PasswordResetSessionSchema = Schema.Struct({
  email: Schema.String,
  token: Schema.String,
});

export const GoogleIDTokenSchema = Schema.Struct({
  name: Schema.String,
  email: Schema.String,
  picture: Schema.String,
});

export const EncryptableSessionSchema = Schema.Union(
  UserSessionSchema,
  EmailVerificationSessionSchema,
  PasswordResetSessionSchema,
  OAuthStateSchema
);

export type EncryptableSession = Schema.Schema.Type<
  typeof EncryptableSessionSchema
>;
