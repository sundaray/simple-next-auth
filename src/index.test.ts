import { describe, it, expect } from 'vitest';
import { initGoogleAuth } from './index.js';

describe('initGoogleAuth', () => {
  it('should return auth instance with signIn and signOut methods', () => {
    const auth = initGoogleAuth({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'http://localhost:3000/callback',
    });

    expect(auth).toHaveProperty('signIn');
    expect(auth).toHaveProperty('signOut');
    expect(typeof auth.signIn).toBe('function');
    expect(typeof auth.signOut).toBe('function');
  });
});
