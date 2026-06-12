import Product from "../../models/productModels.js";
import cloudinary from "../../config/cloudinary.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";

export const createProduct = async (req, res) => {
  try {
    const { title, description, price, discountPrice, category, subCategory, stock } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ success: false, message: "title, price and category are required" });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer, "meesho/products");
        images.push(uploaded);
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
      stock,
      seller: req.user.userId,
    });

    res.status(201).json({ success: true, data: product });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .populate("seller")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: products });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.userId,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (req.files && req.files.length > 0) {
      for (let img of product.images) {
        if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
      }

      const newImages = [];
      for (let file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer, "meesho/products");
        newImages.push(uploaded);
      }
      req.body.images = newImages;
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.userId },
      req.body,
      { new: true }
    );

    res.json({ success: true, data: updatedProduct });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.userId,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    for (let img of product.images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    await Product.findOneAndDelete({ _id: req.params.id, seller: req.user.userId });

    res.json({ success: true, message: "Product deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("seller");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.userId });

    res.json({ success: true, data: products });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const products = await Product.find({ category: categoryId }).populate("category");

    res.status(200).json({ success: true, count: products.length, products });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const {
      keyword, category, seller,
      minPrice, maxPrice,
      page = 1, limit = 10, sort = "latest"
    } = req.query;

    const pageNum  = Number(page);
    const limitNum = Number(limit);

    // only approved products visible publicly
    let query = { status: "approved" };

    if (keyword)  query.title    = { $regex: keyword, $options: "i" };
    if (category) query.category = category;
    if (seller)   query.seller   = seller;

    // price filter
    if (minPrice !== undefined || maxPrice !== undefined) {

      // validate they are valid numbers
      if (minPrice !== undefined && isNaN(Number(minPrice))) {
        return res.status(400).json({ success: false, message: "minPrice must be a valid number" });
      }
      if (maxPrice !== undefined && isNaN(Number(maxPrice))) {
        return res.status(400).json({ success: false, message: "maxPrice must be a valid number" });
      }

      // validate minPrice not greater than maxPrice
      if (minPrice !== undefined && maxPrice !== undefined && Number(minPrice) > Number(maxPrice)) {
        return res.status(400).json({ success: false, message: "minPrice cannot be greater than maxPrice" });
      }

      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    let sortOption = {};
    if (sort === "low")    sortOption.price     = 1;
    if (sort === "high")   sortOption.price     = -1;
    if (sort === "latest") sortOption.createdAt = -1;

    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .populate("category")
      .populate("seller" , "name email")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    return res.status(200).json({
      success: true,
      page:          pageNum,
      totalPages:    Math.ceil(total / limitNum),
      totalProducts: total,
      count:         products.length,
      products,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductsByCategoryAndSubcategory = async (req, res) => {
  try {
    const { category, subCategory } = req.query;

    const query = {};
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;

    const products = await Product.find(query)
      .populate("category")
      .populate("subCategory")
      .populate("seller", "name email");

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

