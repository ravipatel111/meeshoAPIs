import User from "../../models/userModel.js";
import cloudinary from "../../config/cloudinary.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";
import { clearCookieOptions } from "../../config/cookieConfig.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -otp -otpExpiresAt -resetToken -resetTokenExpiry"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { username, mobile } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (req.file) {
      if (user.profileImage && user.profileImage.public_id) {
        await cloudinary.uploader.destroy(user.profileImage.public_id);
      }
      const uploaded = await uploadToCloudinary(req.file.buffer, "meesho/profiles");
      user.profileImage = uploaded;
    }

    if (username) user.username = username;
    if (mobile)   user.mobile   = mobile;

    await user.save();

    const updated = await User.findById(req.user.userId).select(
      "-password -otp -otpExpiresAt -resetToken -resetTokenExpiry"
    );

    res.json({ success: true, message: "Profile updated", user: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isDeleted = true;
    await user.save();

    res.clearCookie("token", clearCookieOptions);

    res.json({ success: true, message: "Account deleted successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
