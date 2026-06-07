import express from "express";

// Seller auth routes disabled for admin-user only mode
/*
import {
  registerSeller,
  loginSeller,
  verifySellerOtp,
  verifyEmailSeller,
  resetSellerPassword,
  changeSellerPassword,
  logoutSeller,
} from "../../controllers/auth/sellerAuth.js";
import { auth, isSeller } from "../../middleware/authMiddleware.js";
import { uploadProfileImage } from "../../middleware/upload.js";
import validate from "../../middleware/validate.js";
import {
  sellerRegisterSchema,
  loginSchema,
  verifySellerOtpSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../../validators/authValidator.js";

const router = express.Router();

router.post("/register", uploadProfileImage, validate(sellerRegisterSchema), registerSeller);
router.post("/login", validate(loginSchema), loginSeller);
router.post("/verify-otp", validate(verifySellerOtpSchema), verifySellerOtp);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmailSeller);
router.post("/reset-password", validate(resetPasswordSchema), resetSellerPassword);
router.post("/change-password", auth, isSeller, validate(changePasswordSchema), changeSellerPassword);
router.post("/logout", auth, isSeller, logoutSeller);
*/

const router = express.Router();

export default router;
