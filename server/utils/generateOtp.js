import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// generate 6-digit random otp with bcrypt hash and 10 min expiry
export const generateOtp = async () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  return {
    otp,
    hashedOtp,
    expiry,
  };
};

export default generateOtp;
