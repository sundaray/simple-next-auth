import type { AuthProviderId } from '../../providers/types';
import {
  GetSessionError,
  SaveSessionError,
  DeleteSessionError,
} from './errors';

import { ResultAsync } from 'neverthrow';

export interface UserSessionPayload {
  maxAge: number;
  provider: AuthProviderId;
  [key: string]: unknown;
}

export interface SessionStorage<TContext> {
  getSession(context: TContext): ResultAsync<string | null, GetSessionError>;
  saveSession(
    context: TContext,
    session: string,
  ): ResultAsync<void, SaveSessionError>;
  deleteSession(context: TContext): ResultAsync<void, DeleteSessionError>;
}

export interface CookieOptions {
  maxAge?: number;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
}
