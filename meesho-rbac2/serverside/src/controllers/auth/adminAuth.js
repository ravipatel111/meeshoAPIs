import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Admin from "../../models/adminModel.js";
import { cookieOptions, clearCookieOptions } from "../../config/cookieConfig.js";

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const admin = await Admin.findOne({ email });
    let passwordHash = admin?.password;

    if (!admin) {
      if (email !== process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }
      passwordHash = process.env.ADMIN_PASSWORD_HASH;
    }

    const match = await bcrypt.compare(password, passwordHash);
    if (!match) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const tokenPayload = {
      role: "admin",
      email,
    };

    if (admin) {
      tokenPayload.adminId = admin._id;
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, cookieOptions);

    res.json({ success: true, token, message: "Admin login success" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutAdmin = async (req, res) => {
  res.clearCookie("token", clearCookieOptions);
  res.json({ success: true, message: "Admin logout success" });
};
