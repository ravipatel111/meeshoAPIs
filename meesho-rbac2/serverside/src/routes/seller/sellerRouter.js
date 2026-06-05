import express from "express";

// import {
//   addProduct,
//   updateSellerProduct,
//   deleteSellerProduct,
//   getSellerProducts,
//   updateStock,
//   updatePrice,
// } from "../../controllers/products/adminProductControllers.js";

// import { auth, isSeller, isSellerApproved } from "../../middleware/authMiddleware.js";
// import {
//   acceptOrder,
//   deliverOrder,
//   getSellerEarnings,
//   getSellerOrders,
//   getSellerPayments,
//   rejectOrder,
//   shipOrder,
// } from "../../controllers/seller/seller.js";

const router = express.Router();

// -- seller product management (commented out — seller role disabled) --
// router.post("/seller/create/product", auth, isSeller, isSellerApproved, addProduct);
// router.put("/seller/product/update/:id", auth, isSeller, updateSellerProduct);
// router.delete("/seller/product/delete/:id", auth, isSeller, deleteSellerProduct);
// router.get("/seller/getall/products", auth, isSeller, getSellerProducts);

// -- stock and price --
// router.put("/seller/product/updateStock/:id", auth, isSeller, updateStock);
// router.put("/seller/product/updatePrice/:id", auth, isSeller, updatePrice);

// -- seller order management --
// router.get("/seller/orders", auth, isSeller, getSellerOrders);
// router.put("/seller/order/accept/:id", auth, isSeller, acceptOrder);
// router.put("/seller/order/reject/:id", auth, isSeller, rejectOrder);
// router.put("/seller/order/ship/:id", auth, isSeller, shipOrder);
// router.put("/seller/order/deliver/:id", auth, isSeller, deliverOrder);

// -- seller payments --
// router.get("/seller/payments", auth, isSeller, getSellerPayments);
// router.get("/seller/earnings", auth, isSeller, getSellerEarnings);

export default router;
