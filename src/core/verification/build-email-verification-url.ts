export function buildEmailVerificationUrl(
  baseUrl: string,
  token: string,
  path: `/${string}` = '/api/auth/verify-email',
) {
  const url = new URL(`${baseUrl}${path}`);
  url.searchParams.set('token', token);
  return url.toString();
}
