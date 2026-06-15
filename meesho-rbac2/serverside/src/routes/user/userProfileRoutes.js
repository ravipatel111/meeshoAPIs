import express from "express";
import { getUserProfile, updateUserProfile, deleteUserProfile } from "../../controllers/user/userProfile.js";
import { auth, isUser } from "../../middleware/authMiddleware.js";
import { uploadProfileImage } from "../../middleware/upload.js";

const router = express.Router();

router.get("/user/profile", auth, isUser, getUserProfile);
router.put("/user/profile", auth, isUser, uploadProfileImage, updateUserProfile);
router.delete("/user/profile", auth, isUser, deleteUserProfile);

export default router;
