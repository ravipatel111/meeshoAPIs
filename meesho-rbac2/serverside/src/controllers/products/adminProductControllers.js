import Product from "../../models/productModels.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "storeName email")
      .populate("category", "name")
      .populate("subCategory", "name");

    res.json({ success: true, products });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

export const approveProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, product });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, product });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProductByAdmin = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// seller-facing functions used in sellerRouter
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

export const updatePrice = async (req, res) => {
  try {
    const { price } = req.body;

    if (!price) {
      return res.status(400).json({ success: false, message: "price is required" });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.userId },
      { price },
      { new: true }
    );

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, product });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
