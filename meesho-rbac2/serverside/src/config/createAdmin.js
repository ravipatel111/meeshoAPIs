import Admin from "../models/adminModel.js";
import bcrypt from "bcrypt";

const createAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@123gmail.com";
    const adminName = process.env.ADMIN_NAME || "SuperAdmin";
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const adminPlainPassword = process.env.ADMIN_PASSWORD || "admin@123";

    const admin = await Admin.findOne({ email: adminEmail });

    if (!admin) {
      const password = adminPasswordHash
        ? adminPasswordHash
        : await bcrypt.hash(adminPlainPassword, 10);

      await Admin.create({
        name: adminName,
        email: adminEmail,
        password,
        role: "superadmin",
      });

      console.log(`Static Admin Created: ${adminEmail}`);
    } else {
      if (admin.role !== "superadmin") {
        admin.role = "superadmin";
        await admin.save();
        console.log("Seeded Admin updated to superadmin");
      } else {
        console.log("Admin already exists");
      }
    }
  } catch (error) {
    console.log("Admin create error:", error.message);
  }
};

export default createAdmin;