import "server-only";

/************************************************
 *
 * Create password reset verification URL
 *
 ************************************************/
export function createPasswordResetURL(token: string): string {
  const url = new URL("/api/auth/verify-password-reset", process.env.BASE_URL);
  url.searchParams.set("token", token);
  return url.toString();
}
