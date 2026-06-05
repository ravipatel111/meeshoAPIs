import { Category } from "../../models/categoryModels.js";
import cloudinary from "../../config/cloudinary.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";

export const createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res
        .status(400)
        .json({ success: false, message: "name and slug are required" });
    }

   let image = "";
    if (req.file) {
      const uploaded = await uploadToCloudinary(
        req.file.buffer,
        "meesho/categories",
      );
      image = uploaded.url;
      req.body.image_public_id = uploaded.public_id;
     
    }
   
    const category = await Category.create({ name, slug, image });

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // if new image uploaded, delete old one from cloudinary
    if (req.file) {
      if (category.image_public_id) {
        await cloudinary.uploader.destroy(category.image_public_id);
      }
      const uploaded = await uploadToCloudinary(
        req.file.buffer,
        "meesho/categories",
      );
      req.body.image = uploaded.url;
      req.body.image_public_id = uploaded.public_id;
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({ success: true, category: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // delete image from cloudinary
    if (category.image_public_id) {
      await cloudinary.uploader.destroy(category.image_public_id);
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
