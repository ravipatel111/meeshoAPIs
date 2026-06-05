import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetEmail = async ({ to, name, token }) => {
  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your Meesho account password. Click the button below to reset it. This link expires in <strong>10 minutes</strong>.</p>
      <a href="${resetUrl}" style="display:inline-block; padding: 12px 24px; background:#e91e8c; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold; margin: 16px 0;">Reset Password</a>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p style="color:#888; font-size:12px;">If the button doesn't work, copy this link: ${resetUrl}</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Meesho" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your Meesho password",
    html,
  });
};

export default sendResetEmail;
