import Admin from "../models/adminModel.js";
import bcrypt from "bcrypt";

const createAdmin = async () => {
  try {
    const admin = await Admin.findOne({ email: "admin@12345gmail.com" });

    if (!admin) {
      const hashedPassword = await bcrypt.hash("admin@123", 10);

      await Admin.create({
        name: "SuperAdmin",
        email: "admin@12345gmail.com",
        password: hashedPassword,
      });

      console.log("Static Admin Created");
    } else {
      console.log("Admin already exists");
    }
  } catch (error) {
    console.log("Admin create error:", error.message);
  }
};

export default createAdmin;