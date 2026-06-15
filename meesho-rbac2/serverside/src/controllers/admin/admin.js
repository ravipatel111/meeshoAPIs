import User from "../../models/userModel.js";
import Order from "../../models/orderModel.js";
import Cart from "../../models/cartModels.js";
import Wishlist from "../../models/wishlistModel.js";
// import Seller from "../../models/vendorModel.js"; // seller management disabled
import Product from "../../models/productModels.js";
import Address from "../../models/addressModel.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: { $ne: true } }).select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const orders = await Order.find({ user: id });
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const cancelledOrders = orders.filter((o) => o.orderStatus === "cancelled").length;

    const cart = await Cart.findOne({ user: id });
    const wishlist = await Wishlist.findOne({ user: id });

    res.json({
      success: true,
      user,
      behavior: {
        totalOrders,
        totalSpent,
        cancelledOrders,
        cartItems: cart?.items?.length || 0,
        wishlistItems: wishlist?.products?.length || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User blocked", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User unblocked", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isDeleted = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Seller management functions are disabled for admin-user only mode
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select("-password");
    res.json({ success: true, count: sellers.length, sellers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fix: filter by both isApproved:false AND isVerified:true — exclude unverified registrations
export const getPendingSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({ isApproved: false, isVerified: true }).select("-password");
    res.json({ success: true, sellers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findById(id).select("-password");
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });

    const totalProducts = await Product.countDocuments({ seller: id });
    const orders = await Order.find({ seller: id });
    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.json({
      success: true,
      seller,
      activity: { totalProducts, totalOrders, revenue },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, rejectionReason: "" },
      { new: true }
    ).select("-password");
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });
    res.json({ success: true, message: "Seller approved", seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectSeller = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: "reason is required" });
    }
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, rejectionReason: reason },
      { new: true }
    ).select("-password");
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });
    res.json({ success: true, message: "Seller rejected", seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const blockSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true }).select("-password");
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });
    res.json({ success: true, message: "Seller blocked", seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unblockSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true }).select("-password");
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });
    res.json({ success: true, message: "Seller unblocked", seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
*/

// Fix: filter by both isApproved:false AND isVerified:true — exclude unverified registrations
export const getPendingSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({ isApproved: false, isVerified: true }).select("-password");
    res.json({ success: true, sellers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findById(id).select("-password");
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });

    const totalProducts = await Product.countDocuments({ seller: id });
    const orders = await Order.find({ seller: id });
    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.json({
      success: true,
      seller,
      activity: { totalProducts, totalOrders, revenue },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, rejectionReason: "" },
      { new: true }
    ).select("-password");
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });
    res.json({ success: true, message: "Seller approved", seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectSeller = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: "reason is required" });
    }
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, rejectionReason: reason },
      { new: true }
    ).select("-password");
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });
    res.json({ success: true, message: "Seller rejected", seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const blockSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true }).select("-password");
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });
    res.json({ success: true, message: "Seller blocked", seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unblockSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true }).select("-password");
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });
    res.json({ success: true, message: "Seller unblocked", seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
