import User from "../../models/userModel.js";
import Order from "../../models/orderModel.js";
import Seller from "../../models/vendorModel.js";
import Product from "../../models/productModels.js";
import Payment from "../../models/paymentModel.js";
import Refund from "../../models/refundModel.js";


// admin dashboard APIs

export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await Seller.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    const totalRevenue = await Payment.aggregate([
      { $match:
         {
           paymentStatus: "success" 
          } 
        },
      { $group:
         { _id: null, total: { 
          $sum: "$amount" 
        } 
      } 
    },
    ]);

    res.json({
      success: true,
      dashboard: {
        totalUsers,
        totalSellers,
        totalOrders,
        totalProducts,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const pending = await Order.countDocuments({ orderStatus: "pending" });
    const shipped = await Order.countDocuments({ orderStatus: "shipped" });
    const delivered = await Order.countDocuments({ orderStatus: "delivered" });
    const cancelled = await Order.countDocuments({ orderStatus: "cancelled" });

    res.json({ success: true, orders: { pending, shipped, delivered, cancelled } });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRevenueAnalytics = async (req, res) => {
  try {
    const revenue = await Payment.aggregate([
      { $match: { paymentStatus: "success" } },
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
    const users = await User.countDocuments();
    const sellers = await Seller.countDocuments();
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();

    res.json({ success: true, stats: { users, sellers, products, orders } , message : "dashboard statistics"});

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
