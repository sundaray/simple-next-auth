import type { AuthConfig } from '../config/schema';

export interface BaseSignInOptions {
  redirectTo?: `/${string}`;
}

export interface OAuthProvider<
  Config,
  Options extends BaseSignInOptions,
  Result,
> {
  config: AuthConfig;
  providerConfig: Config;
  signIn(options: Options): Promise<void>;
  handleCallback(request: Request): Promise<Result>;
}

export type AnyAuthProvider = OAuthProvider<any, any, any>;

