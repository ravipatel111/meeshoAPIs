import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Fix: use bcrypt.compare instead of plain string comparison
    const match = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

    if (!match) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { role: "admin", email: process.env.ADMIN_EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, token, message: "Admin login success" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutAdmin = async (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Admin logout success" });
};
