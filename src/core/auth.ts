import type { AuthConfig } from '../types';
import type { SessionStorage } from './session/types';
import type {
  AnyAuthProvider,
  AuthProviderId,
  OAuthProvider,
} from '../providers/types';
import {ok, err, Result, ResultAsync, errAsync, safeTry} from "neverthrow"
import type { AuthError } from './errors';

import { OAuthService } from './services/oauth-service';
import { CredentialService } from './services/credential-service';
import { SessionService } from './services/session-service';
import { ProviderRegistry } from './services/provider-registry';

import { ProviderNotFoundError } from './oauth/errors';

export function createAuthHelpers<TContext>(
  config: AuthConfig,
  userSessionStorage: SessionStorage<TContext>,
  oauthSessionStorage: SessionStorage<TContext>,
  providers: AnyAuthProvider[],
) {
  const providerRegistry = new ProviderRegistry(providers);
  const oauthService = new OAuthService<TContext>(config, oauthSessionStorage);
  const credentialService = new CredentialService(config);
  const sessionService = new SessionService<TContext>(config, userSessionStorage);

  return {
    // --------------------------------------------
    // Sign in
    // --------------------------------------------
    signIn: async(providerId: AuthProviderId, options: {redirectTo: `/${string}`} | {email:string, password: string, redirectTo: `/${string}`}) => {
    
    
      const provider = providerRegistry.get(providerId)

      // OAuth Sign In
      if(provider.type === 'oauth') {
        const result = await oauthService.initiateSignIn(provider, options as {redirectTo: `/${string}`})

        if(result.isErr()) {
          return err(result.error)
        }

        const {authorizationUrl, oauthStateJWE} = result.value
        await oauthSessionStorage.saveSession(undefined, oauthStateJWE)

        return ok({authorizationUrl})
      }

      // Credential Sign In
      if(provider.type === 'credential') {
        const credentialProvider = providerRegistry.getCredentialProvider()

        if(!credentialProvider) {
          return err(new ProviderNotFoundError({providerId: 'credential'}))
        }

      const data = options as {
        email: string;
            password: string;
            redirectTo: `/${string}`;
      }

      const signInResult = await credentialService.signIn(
            credentialProvider,
            { email: data.email, password: data.password },
            data.redirectTo,
          );

    if (signInResult.isErr()) {
      return err(signInResult.error);
    }

    const { sessionData, redirectTo } = signInResult.value;

    const sessionResult = await sessionService.createSession(
      sessionData,
      'credential',
    );

    if (sessionResult.isErr()) {
      return err(sessionResult.error);
    }

    const sessionJWE = sessionResult.value;
    await userSessionStorage.saveSession(undefined, sessionJWE);

    return ok({ redirectTo });
      }
    },
  
    // --------------------------------------------
    // Sign Up (Credential)
    // --------------------------------------------
    signUp: (data: {
      email: string;
      password: string;
      [key: string]: unknown;
    }) => {
      const provider = providerRegistry.getCredentialProvider();

      if (!provider) {
        throw new ProviderNotFoundError({ providerId: 'credential' });
      }

      const result = await credentialService.signUp(provider, data);

      if (result.isErr()) {
        throw result.error;
      }

      return result.value;
    },
    // --------------------------------------------
    // Sign out
    // --------------------------------------------
    signOut: async (): Promise<{ redirectTo: string }> => {
      const result = await sessionService.deleteSession();

      if (result.isErr()) {
        throw result.error;
      }

      return { redirectTo: '/' };
    },
    // --------------------------------------------
    // Get user session
    // --------------------------------------------
    getUserSession: async (request: Request) => {
      const result = await sessionService.getSession(request);

      if (result.isErr()) {
        return null;
      }

      return result.value;
    },
    // --------------------------------------------
    // Handle OAuth Callback
    // --------------------------------------------
    handleOAuthCallback: async (
      request: Request,
      providerId: AuthProviderId,
    ): Promise<{ redirectTo: `/${string}` }> => {
      const provider = providerRegistry.get(providerId) as OAuthProvider;

      if (!provider) {
        throw new ProviderNotFoundError({ providerId: 'oauth' });
      }

      // Complete OAuth sign-in
      const signInResult = await oauthService.completeSignIn(request, provider);

      if (signInResult.isErr()) {
        throw signInResult.error;
      }

      const { sessionData, redirectTo } = signInResult.value;

      // Create session
      const sessionResult = await sessionService.createSession(
        sessionData,
        provider.id,
      );

      if (sessionResult.isErr()) {
        throw sessionResult.error;
      }

      const sessionJWE = sessionResult.value;

      // Save session cookie
      await userSessionStorage.saveSession(undefined, sessionJWE);

      // Delete OAuth state cookie
      await oauthSessionStorage.deleteSession(undefined);

      return { redirectTo };
    },
    // --------------------------------------------
    // Handle email verification
    // --------------------------------------------
    handleVerifyEmail: async (
      request: Request,
    ): Promise<{ redirectTo: `/${string}` }> => {
      const provider = providerRegistry.getCredentialProvider();

      if (!provider) {
        throw new ProviderNotFoundError({ providerId: 'oauth' });
      }

      // Verify email
      const result = await credentialService.verifyEmail(request, provider)

      if(result.isErr()) {
        return {redirectTo: }
      }

      const {redirectTo} = result.value

      return {redirectTo}
    },
  };
}

export type AuthHelpers = ReturnType<typeof createAuthHelpers>;
