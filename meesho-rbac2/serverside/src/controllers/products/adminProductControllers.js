import Product from "../../models/productModels.js";
import cloudinary from "../../config/cloudinary.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";

export const createProductByAdmin = async (req, res) => {
  try {
    const { title, description, price, discountPrice, category, subCategory, stock, seller, variants } = req.body;

    const adminId = seller || req.user.adminId;

    if (!title || !price || !category || !adminId) {
      return res.status(400).json({ success: false, message: "title, price, category, and seller (admin) are required" });
    }

    let parsedVariants = [];
    if (variants) {
      parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
    }

    let images = [];
    if (req.files && req.files.images && req.files.images.length > 0) {
      for (let file of req.files.images) {
        const uploaded = await uploadToCloudinary(file.buffer, "meesho/products", "image");
        images.push(uploaded);
      }
    }

    let videos = [];
    if (req.files && req.files.videos && req.files.videos.length > 0) {
      for (let file of req.files.videos) {
        const uploaded = await uploadToCloudinary(file.buffer, "meesho/products", "video");
        videos.push(uploaded);
      }
    }

    const product = await Product.create({
      title,
      description,
      price,
      discountPrice,
      category,
      subCategory,
      images,
      videos,
      stock,
      variants: parsedVariants,
      seller: adminId,
      status: "approved", // admin products are automatically approved
    });

    res.status(201).json({ success: true, data: product });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProductByAdmin = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Process images update
    let finalImages = product.images || [];
    if (req.body.existingImages !== undefined) {
      let existingImages = req.body.existingImages;
      if (typeof existingImages === "string") {
        try {
          existingImages = JSON.parse(existingImages);
        } catch (e) {
          existingImages = [];
        }
      }
      if (!Array.isArray(existingImages)) {
        existingImages = existingImages ? [existingImages] : [];
      }

      const existingPublicIds = new Set(
        existingImages.map(img => typeof img === "string" ? img : img.public_id).filter(Boolean)
      );

      const imagesToDelete = finalImages.filter(img => img.public_id && !existingPublicIds.has(img.public_id));
      for (let img of imagesToDelete) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      finalImages = finalImages.filter(img => img.public_id && existingPublicIds.has(img.public_id));
    } else if (req.files && req.files.images && req.files.images.length > 0) {
      for (let img of product.images) {
        if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
      }
      finalImages = [];
    }

    if (req.files && req.files.images && req.files.images.length > 0) {
      for (let file of req.files.images) {
        const uploaded = await uploadToCloudinary(file.buffer, "meesho/products", "image");
        finalImages.push(uploaded);
      }
    }
    req.body.images = finalImages;

    // Process videos update
    let finalVideos = product.videos || [];
    if (req.body.existingVideos !== undefined) {
      let existingVideos = req.body.existingVideos;
      if (typeof existingVideos === "string") {
        try {
          existingVideos = JSON.parse(existingVideos);
        } catch (e) {
          existingVideos = [];
        }
      }
      if (!Array.isArray(existingVideos)) {
        existingVideos = existingVideos ? [existingVideos] : [];
      }

      const existingPublicIds = new Set(
        existingVideos.map(vid => typeof vid === "string" ? vid : vid.public_id).filter(Boolean)
      );

      const videosToDelete = finalVideos.filter(vid => vid.public_id && !existingPublicIds.has(vid.public_id));
      for (let vid of videosToDelete) {
        await cloudinary.uploader.destroy(vid.public_id, { resource_type: "video" });
      }

      finalVideos = finalVideos.filter(vid => vid.public_id && existingPublicIds.has(vid.public_id));
    } else if (req.files && req.files.videos && req.files.videos.length > 0) {
      for (let vid of product.videos) {
        if (vid.public_id) await cloudinary.uploader.destroy(vid.public_id, { resource_type: "video" });
      }
      finalVideos = [];
    }

    if (req.files && req.files.videos && req.files.videos.length > 0) {
      for (let file of req.files.videos) {
        const uploaded = await uploadToCloudinary(file.buffer, "meesho/products", "video");
        finalVideos.push(uploaded);
      }
    }
    req.body.videos = finalVideos;

    // Clean up temporary body fields
    delete req.body.existingImages;
    delete req.body.existingVideos;

    if (req.body.variants) {
      req.body.variants = typeof req.body.variants === "string" ? JSON.parse(req.body.variants) : req.body.variants;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, data: updatedProduct });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { category, subCategory } = req.query;

    const query = {};
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;

    const products = await Product.find(query)
      .populate("seller", "name email")
      .populate("category", "name")
      .populate("subCategory", "name");

    res.json({ success: true, products });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Seller-specific product queries are disabled for admin-user only mode.
// Admin: get all products filtered by a particular seller ID
export const getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const products = await Product.find({ seller: sellerId })
      .populate("seller", "storeName email mobile")
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 });

    if (!products.length) {
      return res.json({ success: true, total: 0, message: "No products found for this seller", products: [] });
    }

    res.json({ success: true, total: products.length, products });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
*/

export const deleteProductByAdmin = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    for (let img of product.images || []) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    for (let vid of product.videos || []) {
      if (vid.public_id) await cloudinary.uploader.destroy(vid.public_id, { resource_type: "video" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Product deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* seller-facing functions used in sellerRouter
export const addProduct = async (req, res) => {
  try {
    const { title, price, category } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ success: false, message: "title, price and category are required" });
    }

    const product = await Product.create({ ...req.body, seller: req.user.userId });

    res.json({ success: true, product });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSellerProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.userId },
      req.body,
      { new: true }
    );

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, product });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSellerProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user.userId });

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.userId });

    res.json({ success: true, products });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined) {
      return res.status(400).json({ success: false, message: "stock is required" });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.userId },
      { stock },
      { new: true }
    );

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, product });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
*/

export const updateVariantStock = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { stock } = req.body;

    if (stock === undefined) {
      return res.status(400).json({ success: false, message: "stock is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    variant.stock = stock;
    await product.save();

    res.json({ success: true, message: "Variant stock updated successfully", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

