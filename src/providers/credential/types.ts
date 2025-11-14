export interface User {
  email: string;
  [key: string]: unknown;
}

export interface CredentialProviderConfig {
  onSignUp(data: {
    email: string;
    hashedPassword: string;
    [key: string]: unknown;
  }): Promise<User>;

  onSignIn(data: { email: string }): Promise<User & { hashedPassword: string }>;

  emailVerification: {
    path: `/${string}`;
    sendVerificationEmail(params: {
      email: string;
      url: string;
    }): Promise<void>;
    onEmailVerified(data: { email: string }): Promise<void>;
    onError: `/${string}`;
    onSuccess: `/${string}`;
  };
}
