import express from "express";

import {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} from "../../controllers/wishlist/wishlist.js";

import { auth, isUser } from "../../middleware/authMiddleware.js";

const router = express.Router();

// user wishlist management

router.post("/user/wishlist/add", auth, isUser, addToWishlist); // done
router.get("/user/wishlist", auth, isUser, getWishlist); // done
router.delete("/user/wishlist/delete/:productId", auth, isUser, removeFromWishlist); // done

export default router;