import Admin from "../../models/adminModel.js";
import bcrypt from "bcrypt";

export const createSubAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Name, email and password are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "Admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const subAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      success: true,
      message: "Sub-Admin created successfully",
      data: {
        _id: subAdmin._id,
        name: subAdmin.name,
        email: subAdmin.email,
        role: subAdmin.role,
        isBlocked: subAdmin.isBlocked,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllSubAdmins = async (req, res) => {
  try {
    // Get all admins, sorted by creation date
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleBlockSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    if (admin.role === "superadmin") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot block a Super Admin account" });
    }

    admin.isBlocked = !admin.isBlocked;
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Admin ${admin.isBlocked ? "blocked" : "unblocked"} successfully`,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isBlocked: admin.isBlocked,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    if (admin.role === "superadmin") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot delete a Super Admin account" });
    }

    await Admin.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
      data: { _id: id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
