import User from "../../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import getotp from "../../utils/otp.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";
import {
  cookieOptions,
  clearCookieOptions,
} from "../../config/cookieConfig.js";

export const registerUser = async (req, res) => {
  try {
    const { username, email, mobile, password, confirmpassword } = req.body;

    if (!username || !email || !mobile || !password || !confirmpassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    if (password !== confirmpassword) {
      return res
        .status(400)
        .json({ success: false, message: "Password mismatch" });
    }

    const exist = await User.findOne({
      $or: [{ email }, { mobile }, { username }],
    });

    if (exist) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = getotp();

    let profileImage = { url: "", public_id: "" };
    if (req.file) {
      profileImage = await uploadToCloudinary(
        req.file.buffer,
        "meesho/profiles",
      );
    }

    const user = await User.create({
      username,
      email,
      mobile,
      password: hashed,
      profileImage,
      otp,
      otpExpiresAt: Date.now() + 5 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      data: user._id,
      otp,
      message: "User registered successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyUserOtp = async (req, res) => {
  try {
    const { userId, email, otp } = req.body;

    if ((!userId && !email) || !otp) {
      return res.status(400).json({
        success: false,
        message: "userId or email, and otp are required",
      });
    }

    const query = {
      otp: otp,
      otpExpiresAt: { $gt: Date.now() },
    };

    if (userId) {
      query._id = userId;
    } else {
      query.email = email;
    }

    const user = await User.findOne(query);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpiresAt = null;
    user.isVerified = true;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (user.isDeleted) {
      return res
        .status(403)
        .json({ success: false, message: "This account has been deleted" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Verify your account first" });
    }

    if (user.isBlocked) {
      return res
        .status(403)
        .json({ success: false, message: "Your account is blocked" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const verifyEmailUser = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email required" });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     const token = crypto.randomBytes(32).toString("hex");
//     user.resetToken = token;
//     user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
//     await user.save();

//     // await sendResetEmail({ to: email, name: user.username, token });

//     res.status(200).json({
//       success: true,
//       message: "Password reset link sent to your email",
//       Token: token,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const verifyEmailUser = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Reset token generated",
      resetToken: token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Token and password required" });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Old and new password required" });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);

    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Old password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password changed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie("token", clearCookieOptions);
  res.json({ success: true, message: "Logged out successfully" });
};
