import express from "express";
import {
  createSubAdmin,
  getAllSubAdmins,
  toggleBlockSubAdmin,
  deleteSubAdmin,
} from "../../controllers/admin/subAdminController.js";
import { auth, isAdmin, isSuperAdmin } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/admin/subadmins", auth, isAdmin, isSuperAdmin, createSubAdmin);
router.get("/admin/subadmins", auth, isAdmin, isSuperAdmin, getAllSubAdmins);
router.patch("/admin/subadmins/:id/block", auth, isAdmin, isSuperAdmin, toggleBlockSubAdmin);
router.delete("/admin/subadmins/:id", auth, isAdmin, isSuperAdmin, deleteSubAdmin);

export default router;
