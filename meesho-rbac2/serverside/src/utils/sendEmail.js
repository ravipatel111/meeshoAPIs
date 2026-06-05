import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP email
const sendOtpEmail = async ({ to, name, otp }) => {
  // Render the EJS template
  const templatePath = path.join(__dirname, "../views/emails/otpEmail.ejs");

  const html = await ejs.renderFile(templatePath, { name, otp });

  await transporter.sendMail({
    from: `"Meesho" <${process.env.EMAIL_USER}>`,
    to : to,
    subject: `${otp} is your Meesho verification OTP`,
    html,
  });
};

export default sendOtpEmail;

