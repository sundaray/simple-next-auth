import type { AuthConfig } from '../types';
import type { SessionStorage, UserSessionPayload } from './session/types';
import type { AnyAuthProvider, AuthProviderId } from '../providers/types';
import { ok, ResultAsync, errAsync, safeTry } from 'neverthrow';

import { OAuthService } from './services/oauth-service';
import { CredentialService } from './services/credential-service';
import { SessionService } from './services/session-service';
import { ProviderRegistry } from './services/provider-registry';

import { ProviderNotFoundError } from './oauth/errors';
import {
  SignOutError,
  HandleVerifyEmailError,
  HandleOAuthCallbackError,
  SignUpError,
  SignInError,
} from './errors';
import { GetUserSessionError } from './session/errors';

export function createAuthHelpers<TContext>(
  config: AuthConfig,
  userSessionStorage: SessionStorage<TContext>,
  oauthSessionStorage: SessionStorage<TContext>,
  providers: AnyAuthProvider[],
) {
  const providerRegistry = new ProviderRegistry(providers);
  const oauthService = new OAuthService<TContext>(config, oauthSessionStorage);
  const credentialService = new CredentialService(config);
  const sessionService = new SessionService<TContext>(
    config,
    userSessionStorage,
  );

  return {
    // --------------------------------------------
    // Sign in
    // --------------------------------------------
    signIn: (
      providerId: AuthProviderId,
      context: TContext,
      options:
        | { redirectTo: `/${string}` }
        | { email: string; password: string; redirectTo: `/${string}` },
    ): ResultAsync<
      { authorizationUrl: string } | { redirectTo: `/${string}` },
      SignInError
    > => {
      const providerResult = providerRegistry.get(providerId);

      if (providerResult.isErr()) {
        return errAsync(new SignInError({ cause: providerResult.error }));
      }
      const provider = providerResult.value;

      // ----------------
      // OAuth Sign In
      // ----------------
      if (provider.type === 'oauth') {
        return oauthService
          .initiateSignIn(provider, options as { redirectTo: `/${string}` })
          .andThen(({ authorizationUrl, oauthStateJWE }) => {
            return oauthSessionStorage
              .saveSession(context, oauthStateJWE)
              .map(() => ({ authorizationUrl }));
          })
          .mapErr(
            (error) =>
              new SignInError({
                message: 'OAuth sign in failed.',
                cause: error,
              }),
          );
      }

      // ----------------
      // Credential Sign In
      // ----------------
      if (provider.type === 'credential') {
        const data = options as { email: string; password: string };

        return safeTry(async function* () {
          const credentialProvider =
            yield* providerRegistry.getCredentialProvider();

          // Sign in
          const { sessionData, redirectTo } = yield* credentialService.signIn(
            credentialProvider,
            {
              email: data.email,
              password: data.password,
            },
          );

          // 3. Create user session
          const sessionJWE = yield* sessionService.createSession(
            sessionData,
            'credential',
          );

          // 4. Save user session
          yield* userSessionStorage.saveSession(context, sessionJWE);

          return ok({ redirectTo });
        }).mapErr((error) => {
          return new SignInError({
            message: 'Credential sign in failed.',
            cause: error,
          });
        });
      }

      return errAsync(
        new SignInError({
          message: 'Sign in failed: Unsupported provider type.',
        }),
      );
    },

    // --------------------------------------------
    // Sign Up (Credential)
    // --------------------------------------------
    signUp: (data: {
      email: string;
      password: string;
      [key: string]: unknown;
    }): ResultAsync<{ success: boolean }, SignUpError> => {
      return providerRegistry
        .getCredentialProvider()
        .asyncAndThen((provider) => {
          return credentialService.signUp(provider, data);
        })
        .mapErr((error) => {
          return new SignUpError({ cause: error });
        });
    },
    // --------------------------------------------
    // Sign out
    // --------------------------------------------
    signOut: (
      context: TContext,
    ): ResultAsync<{ redirectTo: string }, SignOutError> => {
      return sessionService
        .deleteSession(context)
        .map(() => ({ redirectTo: '/' }))
        .mapErr((error) => {
          return new SignOutError({ cause: error });
        });
    },
    // --------------------------------------------
    // Get user session
    // --------------------------------------------
    getUserSession: (
      context: TContext,
    ): ResultAsync<UserSessionPayload | null, GetUserSessionError> => {
      return sessionService.getSession(context).mapErr((error) => {
        return new GetUserSessionError({ cause: error });
      });
    },
    // --------------------------------------------
    // Handle OAuth Callback
    // --------------------------------------------
    handleOAuthCallback: (
      request: Request,
      context: TContext,
      providerId: AuthProviderId,
    ): ResultAsync<{ redirectTo: `/${string}` }, HandleOAuthCallbackError> => {
      const providerResult = providerRegistry.get(providerId);

      if (providerResult.isErr()) {
        return errAsync(
          new HandleOAuthCallbackError({ cause: providerResult.error }),
        );
      }

      const provider = providerResult.value;
      if (provider.type !== 'oauth') {
        return errAsync(
          new HandleOAuthCallbackError({
            cause: new ProviderNotFoundError({
              providerId,
            }),
          }),
        );
      }
      return safeTry(async function* () {
        // Complete OAuth sign-in
        const { sessionData, redirectTo } = yield* oauthService.completeSignIn(
          request,
          context,
          provider,
        );

        // Create session
        const session = yield* sessionService.createSession(
          sessionData,
          provider.id,
        );

        // Save session cookie
        yield* userSessionStorage.saveSession(context, session);

        // Delete OAuth state cookie
        yield* oauthSessionStorage.deleteSession(context);

        return ok({ redirectTo });
      }).mapErr((error) => {
        return new HandleOAuthCallbackError({
          cause: error,
        });
      });
    },
    // --------------------------------------------
    // Handle email verification
    // --------------------------------------------
    handleVerifyEmail: (
      request: Request,
    ): ResultAsync<{ redirectTo: `/${string}` }, HandleVerifyEmailError> => {
      return providerRegistry
        .getCredentialProvider()
        .asyncAndThen((provider) => {
          return credentialService.verifyEmail(request, provider);
        })
        .mapErr((error) => {
          return new HandleVerifyEmailError({ cause: error });
        });
    },
  };
}

export type AuthHelpers = ReturnType<typeof createAuthHelpers>;
