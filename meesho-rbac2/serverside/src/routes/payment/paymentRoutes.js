import express from "express";

import {
  createPayment,
  getUserPayments,
  getSellerPaymentsById,
} from "../../controllers/paymentController/paymentController.js";

import {
  getAllPayments,
  updatePaymentStatus,
  getRevenue,
} from "../../controllers/paymentController/adminController.js";

import { auth, isAdmin, isUser } from "../../middleware/authMiddleware.js";

const router = express.Router();

// USER
router.post("/payment/create", auth, isUser, createPayment);
router.get("/payment/my", auth, isUser, getUserPayments);

// ADMIN
router.get("/admin/payments", auth, isAdmin, getAllPayments);
router.put("/admin/payment/update/:id", auth, isAdmin, updatePaymentStatus);
router.get("/admin/revenue", auth, isAdmin, getRevenue);
router.get("/admin/seller/:sellerId/payments", auth, isAdmin, getSellerPaymentsById);

export default router;
