import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log("Testing Nodemailer with credentials:");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "****" + process.env.EMAIL_PASS.slice(-4) : "MISSING");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function run() {
  try {
    const info = await transporter.sendMail({
      from: `"Meesho Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self
      subject: "Nodemailer Test",
      text: "This is a test email.",
    });
    console.log("Email sent successfully!", info.messageId);
  } catch (err) {
    console.error("Nodemailer Error:", err.message);
    if (err.response) {
      console.error("Response:", err.response);
    }
  }
}

run();
