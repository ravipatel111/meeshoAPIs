import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getSellerProducts,
  getProductsByCategory,
  searchProducts,
} from "../../controllers/products/products.js";
import { auth, isAdmin } from "../../middleware/authMiddleware.js";
// import { auth, isSeller, isSellerApproved } from "../../middleware/authMiddleware.js"; // seller guards removed
import { uploadProductImages } from "../../middleware/upload.js";
import validate from "../../middleware/validate.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../../validators/productValidator.js";

const router = express.Router();

// -- SELLER product routes (commented out — seller role disabled) --
// router.post("/seller/product/create", auth, isSeller, isSellerApproved, uploadProductImages, validate(createProductSchema), createProduct);
// router.get("/seller/product/my", auth, isSeller, getSellerProducts);
// router.put("/seller/product/:id", auth, isSeller, uploadProductImages, validate(updateProductSchema), updateProduct);
// router.delete("/seller/product/:id", auth, isSeller, deleteProduct);

// ADMIN product routes
router.post("/admin/product/create", auth, isAdmin, uploadProductImages, validate(createProductSchema), createProduct);
router.get("/admin/product/my", auth, isAdmin, getSellerProducts);
router.put("/admin/product/:id", auth, isAdmin, uploadProductImages, validate(updateProductSchema), updateProduct);
router.delete("/admin/product/:id", auth, isAdmin, deleteProduct);

// PUBLIC routes — no auth required
router.get("/product/all", getAllProducts);
router.get("/product/search", searchProducts);
router.get("/product/category/:categoryId", getProductsByCategory);
router.get("/product/:id", getProductById);

export default router;
