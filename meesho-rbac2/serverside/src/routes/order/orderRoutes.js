import express from "express";
import {
  createOrder,
  getUserOrders,
  cancelOrder,
  raiseDispute,
  returnOrder,
} from "../../controllers/order/order.js";
import {
  getAllOrders,
  updateOrderStatus,
  resolveDispute,
} from "../../controllers/order/adminOrderControllers.js";
import { auth, isAdmin, isUser } from "../../middleware/authMiddleware.js";
import validate from "../../middleware/validate.js";
import { createOrderSchema } from "../../validators/orderValidator.js";

const router = express.Router();

// USER
router.post("/order/create", auth, isUser, validate(createOrderSchema), createOrder);
router.get("/order/my", auth, isUser, getUserOrders);
router.put("/order/cancel/:id", auth, isUser, cancelOrder);
router.put("/order/return/:id", auth, isUser, returnOrder);
router.put("/order/dispute/:id", auth, isUser, raiseDispute);

// ADMIN
router.get("/admin/orders", auth, isAdmin, getAllOrders);
router.put("/admin/order/:id", auth, isAdmin, updateOrderStatus);
router.put("/admin/order/dispute/:id", auth, isAdmin, resolveDispute);

export default router;
