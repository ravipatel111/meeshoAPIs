import express from "express";
import { getOrderTracking } from "../controllers/tracking.controller.js";

const router = express.Router();

// Route: GET /api/orders/:id/tracking
router.get("/orders/:id/tracking", getOrderTracking);

export default router;
