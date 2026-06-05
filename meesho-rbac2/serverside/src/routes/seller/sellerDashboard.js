import express from "express";

// import {
//   getSellerDashboard,
//   getSellerOrderStats,
//   getSellerEarnings,
// } from "../../controllers/seller/sellerDashboard.js";

// import { auth, isSeller } from "../../middleware/authMiddleware.js";

const router = express.Router();

// -- seller dashboard (commented out — seller role disabled) --
// router.get("/seller/dashboard", auth, isSeller, getSellerDashboard);
// router.get("/seller/dashboard/orders", auth, isSeller, getSellerOrderStats);
// router.get("/seller/dashboard/earnings", auth, isSeller, getSellerEarnings);

export default router;
