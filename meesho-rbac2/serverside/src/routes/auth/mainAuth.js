import userAuthRoutes from "./userAuthRoutes.js";
// import sellerAuthRoutes from "./sellerAuthRoutes.js"; // seller auth removed for now
import adminAuthRoutes from "./adminAuthRoutes.js";
import express from "express";

const mainRouter = express.Router();

mainRouter.use("/user/auth", userAuthRoutes);
// mainRouter.use("/seller/auth", sellerAuthRoutes); // seller auth removed for now
mainRouter.use("/admin/auth", adminAuthRoutes);

export default mainRouter;
