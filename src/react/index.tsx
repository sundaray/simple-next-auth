'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserSessionPayload } from '../core/session/types';

import {
  FetchUserSessionError,
  MissingUserSessionProviderError,
} from './errors';

type SessionContextState =
  | { status: 'pending'; data: null; error: null }
  | { status: 'success'; data: UserSessionPayload | null; error: null }
  | { status: 'error'; data: null; error: Error };

const UserSessionContext = createContext<SessionContextState | undefined>(
  undefined,
);

const initialState: SessionContextState = {
  status: 'pending',
  data: null,
  error: null,
};

export function UserSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<SessionContextState>(initialState);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) {
          throw new FetchUserSessionError();
        }

        const userSession = await response.json();
        setState({ status: 'success', data: userSession, error: null });
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        setState({ status: 'error', data: null, error });
      }
    };

    fetchUserSession();
  }, []);

  return (
    <UserSessionContext.Provider value={state}>
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  const context = useContext(UserSessionContext);

  if (!context) {
    throw new MissingUserSessionProviderError();
  }

  return context;
}
