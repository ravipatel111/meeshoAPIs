import express from "express";
import {
  registerUser,
  loginUser,
  verifyUserOtp,
  verifyEmailUser,
  resetUserPassword,
  changeUserPassword,
  logoutUser,
  resendOtp,
} from "../../controllers/auth/userAuth.js";
import { auth } from "../../middleware/authMiddleware.js";
import { uploadProfileImage } from "../../middleware/upload.js";
import validate from "../../middleware/validate.js";
import {
  userRegisterSchema,
  loginSchema,
  verifyUserOtpSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  changePasswordSchema,
  resendOtpSchema,
} from "../../validators/authValidator.js";

const router = express.Router();

router.post("/register", uploadProfileImage, validate(userRegisterSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/verify-otp", validate(verifyUserOtpSchema), verifyUserOtp);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmailUser);
router.post("/reset-password", validate(resetPasswordSchema), resetUserPassword);
router.post("/change-password", auth, validate(changePasswordSchema), changeUserPassword);
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);
router.post("/logout", logoutUser);

export default router;
