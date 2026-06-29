import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Admin from "../../models/adminModel.js";
import {
  cookieOptions,
  clearCookieOptions,
} from "../../config/cookieConfig.js";

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const admin = await Admin.findOne({ email });
    let passwordHash = admin?.password;

    if (!admin) {
      if (
        email !== process.env.ADMIN_EMAIL ||
        !process.env.ADMIN_PASSWORD_HASH
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }
      passwordHash = process.env.ADMIN_PASSWORD_HASH;
    }

    const match = await bcrypt.compare(password, passwordHash);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const tokenPayload = {
      role: "admin",
      email,
    };

    if (admin) {
      tokenPayload.adminId = admin._id;
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("admin_token", token, cookieOptions);

    res.json({
      success: true,
      token,
      message: "Admin login success",
      user: {
        _id: admin._id,
        email: admin.email,
        role: "admin",
        adminRole: admin.role || "admin",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutAdmin = async (req, res) => {
  res.clearCookie("admin_token", clearCookieOptions);
  res.json({ success: true, message: "Admin logout success" });
};

export const changeAdminPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Old and new password required" });
    }

    const adminQuery = req.user.adminId
      ? Admin.findById(req.user.adminId)
      : Admin.findOne({ email: req.user.email });

    const admin = await adminQuery;

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    const match = await bcrypt.compare(oldPassword, admin.password);

    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Old password incorrect" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
