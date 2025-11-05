import type { AuthConfig } from '../config/schema';
import type { FrameworkAdapter } from '../core/adapter';
import { COOKIE_NAMES } from '../core/constants';

export async function signOut(
  config: AuthConfig,
  adapter: FrameworkAdapter,
): Promise<void> {
  await adapter.deleteCookie(COOKIE_NAMES.USER_SESSION);
  adapter.redirect('/');
}
