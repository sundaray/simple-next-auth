import type { AuthConfig } from '../../types';
import type { SessionStorage } from '../session/types';
import type { OAuthProvider } from '../../providers/types';
import {
  generateState,
  generateCodeVerifier,
  generateCodeChallenge,
} from '../pkce';
import { encryptOAuthStatePayload, decryptOAuthStateJWE } from '../oauth';
import { OAUTH_STATE_MAX_AGE } from '../constants';
import type { SignInOptions } from '../../types';
import { ResultAsync } from 'neverthrow';
import { InitiateSignInError, CompleteSignInError } from './errors';

export class OAuthService {
  constructor(
    private config: AuthConfig,
    private oauthStateStorage: SessionStorage<any, any>,
  ) {}

  // --------------------------------------------
  // Initiate OAuth sign-in
  // --------------------------------------------
  initiateSignIn(
    provider: OAuthProvider,
    options?: SignInOptions,
  ): ResultAsync<
    { authorizationUrl: string; oauthStateJWE: string },
    InitiateSignInError
  > {
    return ResultAsync.fromPromise(
      (async () => {
        // Generate state
        const stateResult = generateState();
        if (stateResult.isErr()) {
          throw new InitiateSignInError({
            cause: stateResult.error,
          });
        }

        // Generate code verifier
        const codeVerifierResult = generateCodeVerifier();
        if (codeVerifierResult.isErr()) {
          throw new InitiateSignInError({
            cause: codeVerifierResult.error,
          });
        }

        // Generate code challenge
        const codeChallengeResult = await generateCodeChallenge(
          codeVerifierResult.value,
        );
        if (codeChallengeResult.isErr()) {
          throw new InitiateSignInError({
            cause: codeChallengeResult.error,
          });
        }

        // Encrypt OAuth state
        const oauthStateJWEResult = await encryptOAuthStatePayload({
          oauthState: {
            state: stateResult.value,
            codeVerifier: codeVerifierResult.value,
            redirectTo: options?.redirectTo || '/',
            provider: provider.id,
          },
          secret: this.config.session.secret,
          maxAge: OAUTH_STATE_MAX_AGE,
        });
        if (oauthStateJWEResult.isErr()) {
          throw new InitiateSignInError({
            cause: oauthStateJWEResult.error,
          });
        }

        // Get authorization URL
        const authorizationUrlResult = provider.getAuthorizationUrl({
          state: stateResult.value,
          codeChallenge: codeChallengeResult.value,
        });
        if (authorizationUrlResult.isErr()) {
          throw new InitiateSignInError({
            cause: authorizationUrlResult.error,
          });
        }

        return {
          authorizationUrl: authorizationUrlResult.value,
          oauthStateJWE: oauthStateJWEResult.value,
        };
      })(),
      (error) => {
        if (error instanceof InitiateSignInError) {
          return error;
        }

        return new InitiateSignInError({
          message: 'Unexpected error during OAuth sign-in initiation.',
          cause: error,
        });
      },
    );
  }

  // --------------------------------------------
  // Complete OAuth sign-in
  // --------------------------------------------
  completeSignIn(
    request: Request,
    provider: OAuthProvider,
  ): ResultAsync<
    {
      sessionData: Record<string, unknown>;
      redirectTo: `/${string}`;
    },
    CompleteSignInError
  > {
    return ResultAsync.fromPromise(
      (async () => {
        // Get OAuth state from storage
        const oauthStateJWE = await this.oauthStateStorage.getSession(request);
        if (!oauthStateJWE) {
          throw new CompleteSignInError({
            message: 'OAuth state cookie not found',
          });
        }

        // Decrypt OAuth state
        const oauthStateResult = await decryptOAuthStateJWE({
          jwe: oauthStateJWE,
          secret: this.config.session.secret,
        });
        if (oauthStateResult.isErr()) {
          throw new CompleteSignInError({
            cause: oauthStateResult.error,
          });
        }

        const oauthState = oauthStateResult.value;

        // Complete authentication with provider
        const providerResult = await provider.completeSignin(
          request,
          oauthState,
        );
        if (providerResult.isErr()) {
          throw new CompleteSignInError({
            cause: providerResult.error,
          });
        }

        const userClaims = providerResult.value;

        // Call provider's onAuthenticated callback
        const sessionData = await provider.onAuthenticated(userClaims);

        return {
          sessionData,
          redirectTo: oauthState.redirectTo || '/',
        };
      })(),
      (error) => {
        if (error instanceof CompleteSignInError) {
          return error;
        }
        return new CompleteSignInError({
          message: 'Unexpected error completing OAuth sign-in.',
          cause: error,
        });
      },
    );
  }
}
