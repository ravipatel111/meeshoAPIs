import express from "express";

import {
    loginAdmin,
    logoutAdmin
} from "../../controllers/auth/adminAuth.js";
import { auth, isAdmin } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin); // done
router.post("/logout",auth , isAdmin, logoutAdmin); // done

export default router;