import { cookies } from 'next/headers';
import type { CookieOptions } from '../core/session/types';
import type { SessionStorage } from '../core/session/types';
import { ResultAsync } from 'neverthrow';
import {
  DeleteSessionError,
  GetSessionError,
  SaveSessionError,
} from '../core/session/errors';

export class NextJsSessionStorage implements SessionStorage<undefined> {
  private cookieName: string;
  private cookieOptions: CookieOptions;

  constructor(cookieName: string, cookieOptions: CookieOptions) {
    this.cookieName = cookieName;
    this.cookieOptions = cookieOptions;
  }

  getSession(context: undefined): ResultAsync<string | null, GetSessionError> {
    return ResultAsync.fromPromise(
      (async () => {
        const cookieStore = await cookies();
        const cookie = cookieStore.get(this.cookieName);
        return cookie?.value ?? null;
      })(),
      (error) => new GetSessionError({ cause: error }),
    );
  }

  saveSession(
    context: undefined,
    session: string,
  ): ResultAsync<void, SaveSessionError> {
    return ResultAsync.fromPromise(
      (async () => {
        const cookieStore = await cookies();

        cookieStore.set(this.cookieName, session, {
          ...this.cookieOptions,
        });
      })(),
      (error) => new SaveSessionError({ cause: error }),
    );
  }

  deleteSession(context: undefined): ResultAsync<void, DeleteSessionError> {
    return ResultAsync.fromPromise(
      (async () => {
        const cookieStore = await cookies();
        cookieStore.delete(this.cookieName);
      })(),
      (error) => new DeleteSessionError({ cause: error }),
    );
  }
}
