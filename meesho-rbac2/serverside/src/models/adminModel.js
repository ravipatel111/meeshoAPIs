import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
    },

    password: {
      type: String,
    },

    name: {
      type: String,
      default: "Admin",
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;