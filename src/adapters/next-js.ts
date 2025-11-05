import { cookies } from 'next/headers';
import { redirect as nextRedirect, RedirectType } from 'next/navigation';

import type { FrameworkAdapter, CookieOptions } from '../core/adapter';

import {
  GetCookieError,
  SetCookieError,
  DeleteCookieError,
} from '../core/errors';

export class NextjsAdapter implements FrameworkAdapter {
  async setCookie(
    name: string,
    value: string,
    options: CookieOptions,
  ): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.set(name, value, {
        maxAge: options.maxAge,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    } catch (error) {
      throw new SetCookieError({ cause: error });
    }
  }

  async getCookie(name: string): Promise<string | undefined> {
    try {
      const cookieStore = await cookies();
      const cookie = cookieStore.get(name);
      return cookie?.value;
    } catch (error) {
      throw new GetCookieError({ cause: error });
    }
  }

  async deleteCookie(name: string): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.delete(name);
    } catch (error) {
      throw new DeleteCookieError({ cause: error });
    }
  }

  redirect(url: string, type?: string): void {
    const redirectType =
      type === 'replace' ? RedirectType.replace : RedirectType.push;
    nextRedirect(url, redirectType);
  }
}
