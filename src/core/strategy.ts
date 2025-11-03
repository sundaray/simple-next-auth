import type { AuthConfig } from '../config/schema';

export interface BaseSignInOptions {
  redirectTo?: `/${string}`;
}

export interface OAuthStrategy<
  Config,
  Options extends BaseSignInOptions,
  Result,
> {
  config: AuthConfig;
  providerConfig: Config;
  signIn(options: Options): Promise<never>;
  handleCallback(request: Request): Promise<Result>;
}

export type AnyAuthStrategy = OAuthStrategy<any, any, any>;
