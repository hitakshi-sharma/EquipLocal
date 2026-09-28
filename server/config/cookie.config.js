export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

const isProduction = process.env.NODE_ENV === 'production';

// Base cookie options
export const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
};

// Access token cookie options (15 minutes)
export const accessCookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000,
};

// Refresh token cookie options (7 days)
export const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Set auth cookies
export const setAuthCookies = (res, tokens) => {
  if (tokens?.accessToken) {
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, accessCookieOptions);
  }
  if (tokens?.refreshToken) {
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, refreshCookieOptions);
  }
};

// Set access token cookie
export const setAccessTokenCookie = (res, accessToken) => {
  if (accessToken) {
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, accessCookieOptions);
  }
};

// Clear auth cookies on logout
export const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);
};

// Read refresh token from request
export const getRefreshTokenFromReq = (req) => {
  return (
    req.cookies?.[REFRESH_TOKEN_COOKIE] ||
    req.body?.refreshToken ||
    req.headers['x-refresh-token'] ||
    null
  );
};

export default {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  cookieOptions,
  accessCookieOptions,
  refreshCookieOptions,
  setAuthCookies,
  setAccessTokenCookie,
  clearAuthCookies,
  getRefreshTokenFromReq,
};
