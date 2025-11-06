import type { AuthConfig } from '../../config/schema';
import type { FrameworkAdapter } from '../../types';
import type { AnyAuthProvider } from '../../core/strategy';
import type { AuthProvider } from '../../types';

import { runOAuthProviderSignInCallback } from './run-oauth-provider-signin-callback';
import { createUserSessionPayload } from '../session/create-user-session-payload';
import { encryptUserSessionPayload } from '../session';
import { deleteOauthStateCookie } from '../session/delete-oauth-state-cookie';
import { setUserSessionCookie } from '../session/set-user-session-cookie';

export async function processOAuthSignin(
  authConfig: AuthConfig,
  frameworkAdapter: FrameworkAdapter,
  authProvider: AnyAuthProvider,
  request: Request,
): Promise<void> {
  // Run the OAuth signin callback
  const oauthSignInResult = await runOAuthProviderSignInCallback({
    authProvider,
    request,
  });

  if (oauthSignInResult.isErr()) {
    throw oauthSignInResult.error;
  }
  const signInResult = oauthSignInResult.value;

  // Create the user session payload
  const userSessionPayloadResult = await createUserSessionPayload({
    authConfig,
    providerName: signInResult.oauthState.provider,
    providerUserClaims: signInResult.userClaims,
  });

  if (userSessionPayloadResult.isErr()) {
    throw userSessionPayloadResult.error;
  }

  const userSessionPayload = userSessionPayloadResult.value;

  // Encrypt the user session payload
  const encryptUserSessionPayloadResult = await encryptUserSessionPayload({
    userSessionPayload,
    secret: authConfig.session.secret,
    maxAge: authConfig.session.maxAge,
  });

  if (encryptUserSessionPayloadResult.isErr()) {
    throw encryptUserSessionPayloadResult.error;
  }

  const encrypteduserSessionPayload = encryptUserSessionPayloadResult.value;

  // Set the user session cookie
  const userSessionCookieResult = await setUserSessionCookie({
    frameworkAdapter,
    authConfig,
    jwe: encrypteduserSessionPayload,
  });
  if (userSessionCookieResult.isErr()) {
    throw userSessionCookieResult.error;
  }

  // Delete the OAuth state cookie
  const deleteOauthStateCookieResult = await deleteOauthStateCookie({
    frameworkAdapter,
  });
  if (deleteOauthStateCookieResult.isErr()) {
    throw deleteOauthStateCookieResult.error;
  }

  // Redirect user to their intended destination
  const redirectTo = signInResult.oauthState.redirectTo || '/';
  frameworkAdapter.redirect(redirectTo, 'replace');
}
