import express from "express";

import {
  getAllUsers,
  getUserDetails,
  blockUser,
  unblockUser,
  deleteUser,
  // getAllSellers,
  // getPendingSellers,
  // getSellerDetails,
  // approveSeller,
  // rejectSeller,
  // blockSeller,
  // unblockSeller,
} from "../../controllers/admin/admin.js";

import {
  getAdminDashboard,
  getOrderStats,
  getRevenueAnalytics,
  getPlatformStats,
} from "../../controllers/admin/adminDashboard.js";

import {
  getAllProducts,
  deleteProductByAdmin,
  // getProductsBySeller,
} from "../../controllers/products/adminProductControllers.js";

import { auth, isAdmin } from "../../middleware/authMiddleware.js";

const router = express.Router();

// admin user management
router.get("/admin/users", auth, isAdmin, getAllUsers);
router.get("/admin/user/:id", auth, isAdmin, getUserDetails);
router.patch("/admin/user/block/:id", auth, isAdmin, blockUser);
router.patch("/admin/user/unblock/:id", auth, isAdmin, unblockUser);
router.delete("/admin/user/:id", auth, isAdmin, deleteUser);

// Seller management routes are disabled for this project
// router.get("/admin/sellers", auth, isAdmin, getAllSellers);
// router.get("/admin/sellers/pending", auth, isAdmin, getPendingSellers);
// router.get("/admin/seller/:id", auth, isAdmin, getSellerDetails);
// router.patch("/admin/seller/approve/:id", auth, isAdmin, approveSeller);
// router.patch("/admin/seller/reject/:id", auth, isAdmin, rejectSeller);
// router.patch("/admin/seller/block/:id", auth, isAdmin, blockSeller);
// router.patch("/admin/seller/unblock/:id", auth, isAdmin, unblockSeller);

// admin product management
router.get("/admin/getall/products", auth, isAdmin, getAllProducts);
// router.get("/admin/seller/:sellerId/products", auth, isAdmin, getProductsBySeller);
router.delete("/admin/product/delete/:id", auth, isAdmin, deleteProductByAdmin);


// admin dashboard routes
router.get("/admin/dashboard", auth, isAdmin, getAdminDashboard);
router.get("/admin/dashboard/orders", auth, isAdmin, getOrderStats);
router.get("/admin/dashboard/revenue", auth, isAdmin, getRevenueAnalytics);
router.get("/admin/dashboard/stats", auth, isAdmin, getPlatformStats);

export default router;
