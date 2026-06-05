import express from "express";

// import { getSellerProfile, updateSellerProfile } from "../../controllers/sellerProfile/sellerProfile.js";
// import { auth, isSeller } from "../../middleware/authMiddleware.js";
// import { uploadProfileImage } from "../../middleware/upload.js";

const router = express.Router();

// -- seller profile (commented out — seller role disabled) --
// router.get("/seller/profile", auth, isSeller, getSellerProfile);
// router.put("/seller/profile", auth, isSeller, uploadProfileImage, updateSellerProfile);

export default router;
