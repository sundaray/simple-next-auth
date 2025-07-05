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
