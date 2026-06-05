import express from "express";
import {
  createCategory,
  getCategories,
  deleteCategory,
  updateCategory,
} from "../../controllers/category/category.js";

import {
  createSubCategory,
  getSubCategories,
  deleteSubCategory,
  updateSubCategory,
} from "../../controllers/category/subCategory.js";

import { auth, isAdmin } from "../../middleware/authMiddleware.js";
import { uploadProfileImage } from "../../middleware/upload.js";

const router = express.Router();

// PUBLIC routes — no auth required (for users to browse)
router.get("/categories", getCategories);
router.get("/subcategories", getSubCategories);

// ADMIN category routes
router.post("/admin/category", auth, isAdmin, uploadProfileImage, createCategory);
router.get("/admin/get/categories", auth, isAdmin, getCategories);
router.patch("/admin/update/category/:id", auth, isAdmin, uploadProfileImage, updateCategory);
router.delete("/admin/delete/category/:id", auth, isAdmin, deleteCategory);

// ADMIN subcategory routes
router.post("/admin/subcategory", auth, isAdmin, uploadProfileImage, createSubCategory);
router.get("/admin/get/subcategory", auth, isAdmin, getSubCategories);
router.patch("/admin/update/subcategory/:id", auth, isAdmin, uploadProfileImage, updateSubCategory);
router.delete("/admin/delete/subcategory/:id", auth, isAdmin, deleteSubCategory);

export default router;
