import nodemailer from 'nodemailer';

// create transporter if SMTP credentials are provided in env
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  // fallback to service transport if host not set but user and pass provided
  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  return null;
};

// send otp email for verification or password reset
export const sendOtpEmail = async ({
  email,
  name = 'User',
  otp,
  purpose = 'email_verification',
}) => {
  const isVerification = purpose === 'email_verification';
  const subject = isVerification
    ? 'EquipLocal - Your Email Verification Code'
    : 'EquipLocal - Your Password Reset Code';

  const title = isVerification ? 'Verify Your Email' : 'Reset Your Password';
  const description = isVerification
    ? `Hello ${name}, welcome to EquipLocal! Use the 6-digit verification code below to activate your account:`
    : `Hello ${name}, you requested to reset your password. Use the 6-digit code below to set a new password:`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #ea580c; margin: 0; font-size: 24px;">EquipLocal</h2>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Equipment Rental Marketplace</p>
      </div>
      <div style="background-color: #f8fafc; padding: 24px; border-radius: 10px; text-align: center;">
        <h3 style="color: #0f172a; margin-top: 0;">${title}</h3>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">${description}</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ea580c; margin: 20px 0; padding: 14px; background: #ffffff; border: 2px dashed #ea580c; border-radius: 8px; display: inline-block;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #64748b; margin-top: 16px;">
          This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `;

  // print to console for quick local testing
  console.log(`[EMAIL OTP] (${purpose}) ${email}: ${otp}`);

  const transporter = createTransporter();
  if (transporter) {
    try {
      const fromHeader =
        process.env.SMTP_FROM ||
        (process.env.SMTP_USER
          ? `"EquipLocal" <${process.env.SMTP_USER}>`
          : (process.env.EMAIL_USER ? `"EquipLocal" <${process.env.EMAIL_USER}>` : '"EquipLocal" <noreply@equiplocal.com>'));

      await transporter.sendMail({
        from: fromHeader,
        to: email,
        subject,
        html,
      });
      console.log(`Email sent to ${email}`);
    } catch (err) {
      console.error(`Email delivery error: ${err.message}`);
    }
  }
};

export default {
  sendOtpEmail,
};
