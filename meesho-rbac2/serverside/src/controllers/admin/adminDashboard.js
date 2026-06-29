import User from "../../models/userModel.js";
import Order from "../../models/orderModel.js";
import Product from "../../models/productModels.js";
import Payment from "../../models/paymentModel.js";
import Refund from "../../models/refundModel.js";

// admin dashboard APIs

export const getAdminDashboard = async (req, res) => {
  try {
    const isSubAdmin = req.user && req.user.adminRole === "admin";
    const adminId = req.user.adminId;

    let totalUsers, totalOrders, totalProducts, totalRevenue;

    if (isSubAdmin) {
      const distinctUsers = await Order.find({ seller: adminId }).distinct("user");
      totalUsers = distinctUsers.length;
      totalOrders = await Order.countDocuments({ seller: adminId });
      totalProducts = await Product.countDocuments({ seller: adminId });

      const orderIds = await Order.find({ seller: adminId }).distinct("_id");
      const rev = await Payment.aggregate([
        { $match: { paymentStatus: "success", order: { $in: orderIds } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      totalRevenue = rev[0]?.total || 0;
    } else {
      totalUsers = await User.countDocuments();
      totalOrders = await Order.countDocuments();
      totalProducts = await Product.countDocuments();

      const rev = await Payment.aggregate([
        { $match: { paymentStatus: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      totalRevenue = rev[0]?.total || 0;
    }

    res.json({
      success: true,
      dashboard: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const isSubAdmin = req.user && req.user.adminRole === "admin";
    const adminId = req.user.adminId;
    
    const query = {};
    if (isSubAdmin) {
      query.seller = adminId;
    }

    const pending = await Order.countDocuments({ ...query, orderStatus: "pending" });
    const shipped = await Order.countDocuments({ ...query, orderStatus: "shipped" });
    const delivered = await Order.countDocuments({ ...query, orderStatus: "delivered" });
    const cancelled = await Order.countDocuments({ ...query, orderStatus: "cancelled" });
    const returned = await Order.countDocuments({ ...query, orderStatus: "returned" });

    res.json({ success: true, orders: { pending, shipped, delivered, cancelled, returned } });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRevenueAnalytics = async (req, res) => {
  try {
    const isSubAdmin = req.user && req.user.adminRole === "admin";
    const adminId = req.user.adminId;

    const matchQuery = { paymentStatus: "success" };
    if (isSubAdmin) {
      const orderIds = await Order.find({ seller: adminId }).distinct("_id");
      matchQuery.order = { $in: orderIds };
    }

    const revenue = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, revenue });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPlatformStats = async (req, res) => {
  try {
    const isSubAdmin = req.user && req.user.adminRole === "admin";
    const adminId = req.user.adminId;

    let users, products, orders;

    if (isSubAdmin) {
      const distinctUsers = await Order.find({ seller: adminId }).distinct("user");
      users = distinctUsers.length;
      products = await Product.countDocuments({ seller: adminId });
      orders = await Order.countDocuments({ seller: adminId });
    } else {
      users = await User.countDocuments();
      products = await Product.countDocuments();
      orders = await Order.countDocuments();
    }

    res.json({ success: true, stats: { users, products, orders }, message: "dashboard statistics" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
