import pkg from 'jsonwebtoken';

const { sign, verify } = pkg;

// Secrets
const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  'equiplocal_access_secret_key_2026';

const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  'equiplocal_refresh_secret_key_2026';

const RESET_SECRET =
  process.env.JWT_RESET_SECRET ||
  'equiplocal_reset_secret_key_2026';

// Expirations
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const RESET_EXPIRES_IN = process.env.JWT_RESET_EXPIRES_IN || '15m';

// Sign tokens
export const signAccessToken = (payload) =>
  sign({ ...payload, type: 'access' }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });

export const signRefreshToken = (payload) =>
  sign({ ...payload, type: 'refresh' }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });

export const signResetToken = (payload) =>
  sign(
    { ...payload, type: 'reset', purpose: 'password_reset' },
    RESET_SECRET,
    { expiresIn: RESET_EXPIRES_IN }
  );

// Verify tokens
export const verifyAccessToken = (token) => {
  const decoded = verify(token, ACCESS_SECRET);
  if (decoded.type && decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return decoded;
};

export const verifyRefreshToken = (token) => {
  const decoded = verify(token, REFRESH_SECRET);
  if (decoded.type && decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return decoded;
};

export const verifyResetToken = (token) => {
  const decoded = verify(token, RESET_SECRET);
  if (decoded.type && decoded.type !== 'reset') {
    throw new Error('Invalid token type');
  }
  if (decoded.purpose && decoded.purpose !== 'password_reset') {
    throw new Error('Invalid token purpose');
  }
  return decoded;
};

export default {
  signAccessToken,
  signRefreshToken,
  signResetToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyResetToken,
};

