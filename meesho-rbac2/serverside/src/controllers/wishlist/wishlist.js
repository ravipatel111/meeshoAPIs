import Wishlist from "../../models/wishlistModel.js";

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.userId, products: [] });
    }

    const exists = wishlist.products.includes(productId);

    if (exists) {
      return res.status(400).json({ success: false, message: "Already in wishlist" });
    }

    wishlist.products.push(productId);
    await wishlist.save();

    res.json({ success: true, message: "Added to wishlist", wishlist });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.userId }).populate("products");

    res.json({ success: true, wishlist: wishlist || { products: [] } });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.userId });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
    await wishlist.save();

    res.json({ success: true, message: "Removed from wishlist", wishlist });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
