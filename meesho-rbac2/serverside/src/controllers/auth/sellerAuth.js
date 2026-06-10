/*
import Seller from "../../models/vendorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import getotp from "../../utils/otp.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";
import sendResetEmail from "../../utils/sendResetEmail.js";
import { cookieOptions, clearCookieOptions } from "../../config/cookieConfig.js";

export const registerSeller = async (req, res) => {
  try {
    const { storeName, ownerName, email, mobile, password, confirmpassword } = req.body;

    if (!storeName || !ownerName || !email || !mobile || !password || !confirmpassword) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ success: false, message: "Password mismatch" });
    }

    const exist = await Seller.findOne({ $or: [{ email }, { mobile }] });

    if (exist) {
      return res.status(400).json({ success: false, message: "Seller already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = getotp();

    let profileImage = { url: "", public_id: "" };
    if (req.file) {
      profileImage = await uploadToCloudinary(req.file.buffer, "meesho/profiles");
    }

    const seller = await Seller.create({
      storeName,
      ownerName,
      email,
      mobile,
      password: hashed,
      profileImage,
      otp,
      otpExpiresAt: Date.now() + 5 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      data: seller._id,
      otp,
      message: "Seller registered successfully.",
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifySellerOtp = async (req, res) => {
  try {
    const { sellerId, email, otp } = req.body;

    if ((!sellerId && !email) || !otp) {
      return res.status(400).json({ success: false, message: "sellerId or email, and otp are required" });
    }

    const query = {
      otp: otp,
      otpExpiresAt: { $gt: Date.now() },
    };

    if (sellerId) {
      query._id = sellerId;
    } else {
      query.email = email;
    }

    const seller = await Seller.findOne(query);

    if (!seller) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    seller.otp = null;
    seller.otpExpiresAt = null;
    seller.isVerified = true;
    await seller.save();

    res.status(200).json({ success: true, message: "OTP verified successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const seller = await Seller.findOne({ email });

    if (!seller) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, seller.password);

    if (!match) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    if (!seller.isVerified) {
      return res.status(400).json({ success: false, message: "Verify OTP first" });
    }

    if (seller.isBlocked) {
      return res.status(403).json({ success: false, message: "Your account is blocked" });
    }

    const token = jwt.sign(
      { userId: seller._id, role: "seller" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, cookieOptions);

    res.status(200).json({ success: true, token, message: "Seller login successful" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fix: send reset token via email instead of returning it in response
export const verifyEmailSeller = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const seller = await Seller.findOne({ email });

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    seller.resetToken = token;
    seller.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    await seller.save();

    await sendResetEmail({ to: email, name: seller.ownerName, token });

    res.status(200).json({ success: true, message: "Password reset link sent to your email" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetSellerPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and password required" });
    }

    const seller = await Seller.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!seller) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    seller.password = await bcrypt.hash(password, 10);
    seller.resetToken = null;
    seller.resetTokenExpiry = null;
    await seller.save();

    res.status(200).json({ success: true, message: "Password reset success" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changeSellerPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Old and new password required" });
    }

    const seller = await Seller.findById(req.user.userId);

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    const match = await bcrypt.compare(oldPassword, seller.password);

    if (!match) {
      return res.status(400).json({ success: false, message: "Wrong password" });
    }

    seller.password = await bcrypt.hash(newPassword, 10);
    await seller.save();

    res.status(200).json({ success: true, message: "Password changed" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutSeller = async (req, res) => {
  res.clearCookie("token", clearCookieOptions);
  res.json({ success: true, message: "Seller logged out" });
};
*/

