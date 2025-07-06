import { Schema } from "effect";

export const OAuthStateSchema = Schema.Struct({
  state: Schema.String,
  codeVerifier: Schema.String,
  redirect: Schema.String,
});

export const UserSessionSchema = Schema.Struct({
  email: Schema.String,
  role: Schema.String,
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
