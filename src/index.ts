export function initGoogleAuth() {
  return {
    signIn: async () => {
      console.log('Sign in with Google');
    },
    signOut: async () => {
      console.log('Sign out');
    },
  };
}

export interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}
