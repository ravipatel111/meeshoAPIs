import express from "express";

import {
  addToCart,
  getCart,
  getCartItem,
  removeCartItem,
  clearCart,
  cartSummary,
  updateCart
} from "../../controllers/cart/cart.js";

import { auth, isUser } from "../../middleware/authMiddleware.js";

const router = express.Router();

// user cart management
router.post("/user/cart/add", auth, isUser, addToCart);
router.get("/user/cart/get", auth, isUser, getCart);
router.get("/user/cart/item/:productId", auth, isUser, getCartItem);
router.patch("/user/cart/update", auth, isUser, updateCart);
router.delete("/user/cart/remove/item/:id", auth, isUser, removeCartItem);
router.delete("/user/cart/clear", auth, isUser, clearCart);
router.get("/user/cart/summary", auth, isUser, cartSummary);

export default router;
