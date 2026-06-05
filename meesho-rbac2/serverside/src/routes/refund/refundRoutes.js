import express from "express";

import {
  requestRefund,
  getUserRefunds,
} from "../../controllers/refund/refundControllers.js";

import {
  getAllRefunds,
  processRefund,
  updateRefundStatus,
} from "../../controllers/refund/adminRefund.js";

// import {
//   initiateRefund,
//   approveRefund,
//   rejectRefund,
//   completeRefund,
// } from "../../controllers/refund/sellerRefund.js"; // seller refund removed for now

import { auth, isAdmin } from "../../middleware/authMiddleware.js";
// import { auth, isAdmin, isSeller } from "../../middleware/authMiddleware.js"; // isSeller removed

const router = express.Router();

// USER
router.post("/refund/request", auth, requestRefund);
router.get("/refund/my", auth, getUserRefunds);

// -- SELLER refund routes (commented out — seller role disabled) --
// router.post("/seller/refund/initiate", auth, isSeller, initiateRefund);
// router.get("/seller/refund/my", auth, isSeller, getUserRefunds);
// router.put("/seller/refund/approve/:id", auth, isSeller, approveRefund);
// router.put("/seller/refund/reject/:id", auth, isSeller, rejectRefund);
// router.put("/seller/refund/complete/:id", auth, isSeller, completeRefund);

// ADMIN
router.get("/admin/refunds", auth, isAdmin, getAllRefunds);
router.put("/admin/refund/process/:id", auth, isAdmin, processRefund);
router.put("/admin/refund/update/:id", auth, isAdmin, updateRefundStatus);

export default router;
