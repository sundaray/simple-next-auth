// -------------------------------------------
// COOKIE CONFIGURATION
// -------------------------------------------

const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_PREFIX = isProduction ? '__Host-super_auth' : 'super_auth';

export const COOKIE_NAMES = {
  USER_SESSION: `${COOKIE_PREFIX}.user_session`,
  OAUTH_STATE: `${COOKIE_PREFIX}.oauth_state`,
} as const;

export const OAUTH_STATE_MAX_AGE = 60 * 10; // 10 minutes

// -------------------------------------------
// EMAIL VERIFICATION
// -------------------------------------------

export const EMAIL_VERIFICATION_TOKEN_EXPIRES_IN = 60 * 30; // 30 minutes
