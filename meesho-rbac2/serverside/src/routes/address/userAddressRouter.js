import express from "express";
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../controllers/address/userAddress.js";
import { auth, isUser } from "../../middleware/authMiddleware.js";
import validate from "../../middleware/validate.js";
import {
  addAddressSchema,
  updateAddressSchema,
} from "../../validators/addressValidator.js";

const router = express.Router();

router.post("/user/address/create", auth, isUser, validate(addAddressSchema), addAddress);
router.get("/user/address", auth, isUser, getAddresses);
router.put("/user/address/:id", auth, isUser, validate(updateAddressSchema), updateAddress);
router.delete("/user/address/:id", auth, isUser, deleteAddress);
router.put("/user/address/default/:id", auth, isUser, setDefaultAddress);

export default router;
