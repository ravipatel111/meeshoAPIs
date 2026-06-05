import Seller from "../../models/vendorModel.js";
import cloudinary from "../../config/cloudinary.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";

export const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.userId).select(
      "-password -otp -otpExpiresAt -resetToken -resetTokenExpiry"
    );

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    res.json({ success: true, seller });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSellerProfile = async (req, res) => {
  try {
    const { storeName, ownerName, mobile } = req.body;

    const seller = await Seller.findById(req.user.userId);

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    if (req.file) {
      if (seller.profileImage && seller.profileImage.public_id) {
        await cloudinary.uploader.destroy(seller.profileImage.public_id);
      }
      const uploaded = await uploadToCloudinary(req.file.buffer, "meesho/profiles");
      seller.profileImage = uploaded;
    }

    if (storeName) seller.storeName = storeName;
    if (ownerName) seller.ownerName = ownerName;
    if (mobile) seller.mobile = mobile;

    await seller.save();

    const updated = await Seller.findById(req.user.userId).select(
      "-password -otp -otpExpiresAt -resetToken -resetTokenExpiry"
    );

    res.json({ success: true, message: "Profile updated", seller: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
