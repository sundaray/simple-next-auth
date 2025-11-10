import { cookies } from 'next/headers';
import { CookieSessionStorage } from '../core/session/cookie-storage';
import type { AuthConfig } from '../types';
import type { CookieOptions } from '../core/session/types';
import type { ResponseHeaders } from '../core/session/types';

export class NextJsSessionStorage extends CookieSessionStorage<
  Request,
  unknown
> {
  constructor(
    config: AuthConfig,
    cookieName: string,
    cookieOptions: CookieOptions,
  ) {
    super(config, cookieName, cookieOptions);
  }

  async getSession(request: Request): Promise<string | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(this.cookieName);
    return cookie?.value ?? null;
  }

  override async saveSession(
    response: unknown,
    sessionData: string,
  ): Promise<{ response?: unknown; headers?: ResponseHeaders }> {
    const cookieStore = await cookies();

    cookieStore.set(this.cookieName, sessionData, {
      maxAge: this.cookieOptions.maxAge,
      path: this.cookieOptions.path,
      httpOnly: this.cookieOptions.httpOnly,
      secure: this.cookieOptions.secure,
      sameSite: this.cookieOptions.sameSite,
    });

    return {};
  }

  override async deleteSession(
    response: unknown,
  ): Promise<{ response?: unknown; headers?: ResponseHeaders }> {
    const cookieStore = await cookies();

    cookieStore.delete(this.cookieName);

    return {};
  }
}
