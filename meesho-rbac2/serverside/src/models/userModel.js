import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,

    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
    profileImage: {
      url: String,
      public_id: String
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
    },

    otpExpiresAt: {
      type: Date,
    },

    resetToken: {
      type: String,
    },

    resetTokenExpiry: {
      type: Date,
    },

    role: {
      type: String,
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);

export default User;