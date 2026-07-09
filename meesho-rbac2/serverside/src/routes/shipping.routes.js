import express from "express";
import { checkShipping } from "../controllers/shipping.controller.js";

const router = express.Router();

// Route: POST /api/shipping/check
router.post("/shipping/check", checkShipping);

export default router;
