import Order from "../../models/orderModel.js";
import Product from "../../models/productModels.js";
import Payment from "../../models/paymentModel.js";

export const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user.userId;

    const totalProducts = await Product.countDocuments({ seller: sellerId });
    const totalOrders = await Order.countDocuments({ seller: sellerId });

    // Fix: earnings must be fetched via seller's orders, not by Payment.user field
    const sellerOrders = await Order.find({ seller: sellerId }).select("_id");
    const orderIds = sellerOrders.map((o) => o._id);
    const payments = await Payment.find({ order: { $in: orderIds }, paymentStatus: "success" });
    const totalEarnings = payments.reduce((acc, p) => acc + p.amount, 0);

    res.json({
      success: true,
      dashboard: { totalProducts, totalOrders, totalEarnings },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerOrderStats = async (req, res) => {
  try {
    const sellerId = req.user.userId;

    const pending   = await Order.countDocuments({ seller: sellerId, orderStatus: "pending" });
    const shipped   = await Order.countDocuments({ seller: sellerId, orderStatus: "shipped" });
    const delivered = await Order.countDocuments({ seller: sellerId, orderStatus: "delivered" });
    const cancelled = await Order.countDocuments({ seller: sellerId, orderStatus: "cancelled" });

    res.json({ success: true, orders: { pending, shipped, delivered, cancelled } });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerEarnings = async (req, res) => {
  try {
    const sellerId = req.user.userId;

    // Fix: aggregate via seller's orders, not Payment.user
    const sellerOrders = await Order.find({ seller: sellerId }).select("_id");
    const orderIds = sellerOrders.map((o) => o._id);

    const earnings = await Payment.aggregate([
      { $match: { order: { $in: orderIds }, paymentStatus: "success" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, earnings });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
