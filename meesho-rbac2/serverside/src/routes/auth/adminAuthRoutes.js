import express from "express";

import {
    loginAdmin,
    logoutAdmin,
    changeAdminPassword
} from "../../controllers/auth/adminAuth.js";
import { auth, isAdmin } from "../../middleware/authMiddleware.js";
import validate from "../../middleware/validate.js";
import { changePasswordSchema } from "../../validators/authValidator.js";

const router = express.Router();

router.post("/login", loginAdmin); // done
router.post("/logout", auth, isAdmin, logoutAdmin); // done
router.post("/change-password", auth, isAdmin, validate(changePasswordSchema), changeAdminPassword); // done

export default router;