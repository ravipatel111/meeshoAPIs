import { SubCategory } from "../../models/categoryModels.js";
import cloudinary from "../../config/cloudinary.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";

export const createSubCategory = async (req, res) => {
  try {
    const { name, slug, category } = req.body;

    if (!name || !slug || !category) {
      return res.status(400).json({ success: false, message: "name, slug and category are required" });
    }

    let image = "";
    let image_public_id = "";
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer, "meesho/categories");
      image = uploaded.url;
      image_public_id = uploaded.public_id;
    }

    const subCategory = await SubCategory.create({ name, slug, category, image, image_public_id, createdBy: req.user.adminId });

    res.status(201).json({ success: true, subCategory });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubCategories = async (req, res) => {
  try {
    const query = {};
    if (req.user && req.user.adminRole === "admin") {
      query.createdBy = req.user.adminId;
    }
    const subCategories = await SubCategory.find(query).populate("category", "name").populate("createdBy", "name email");

    res.json({ success: true, subCategories });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);

    if (!subCategory) {
      return res.status(404).json({ success: false, message: "SubCategory not found" });
    }

    if (req.user && req.user.adminRole === "admin" && String(subCategory.createdBy) !== String(req.user.adminId)) {
      return res.status(403).json({ success: false, message: "Access denied. You can only modify your own subcategories." });
    }

    // if new image uploaded, delete old one from cloudinary
    if (req.file) {
      if (subCategory.image_public_id) {
        await cloudinary.uploader.destroy(subCategory.image_public_id);
      }
      const uploaded = await uploadToCloudinary(req.file.buffer, "meesho/categories");
      req.body.image = uploaded.url;
      req.body.image_public_id = uploaded.public_id;
    }

    const updated = await SubCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json({ success: true, subCategory: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);

    if (!subCategory) {
      return res.status(404).json({ success: false, message: "SubCategory not found" });
    }

    if (req.user && req.user.adminRole === "admin" && String(subCategory.createdBy) !== String(req.user.adminId)) {
      return res.status(403).json({ success: false, message: "Access denied. You can only delete your own subcategories." });
    }

    // delete image from cloudinary
    if (subCategory.image_public_id) {
      await cloudinary.uploader.destroy(subCategory.image_public_id);
    }

    await SubCategory.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "SubCategory deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
