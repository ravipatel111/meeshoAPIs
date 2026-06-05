import Product from "../../models/productModels.js";
import Order from "../../models/orderModel.js";
import Payment from "../../models/paymentModel.js";

export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.userId }).populate(
      "user",
      "username email",
    );

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.userId },
      { orderStatus: "confirmed" },
      { new: true },
    );

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.userId },
      { orderStatus: "cancelled" },
      { new: true },
    );

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const shipOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.userId },
      { orderStatus: "shipped" },
      { new: true },
    );

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deliverOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.userId },
      { orderStatus: "delivered" },
      { new: true },
    );

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fixed: fetch payments via seller's orders, not by user field
export const getSellerPayments = async (req, res) => {
  try {
    const sellerOrders = await Order.find({ seller: req.user.userId }).select("_id");
    const orderIds = sellerOrders.map((o) => o._id);

    const payments = await Payment.find({ order: { $in: orderIds } })
      .populate("user", "username email mobile")
      .populate({
        path: "order",
        populate: { path: "product", select: "title price images" },
      })
      .sort({ createdAt: -1 });

    const totalEarnings = payments
      .filter((p) => p.paymentStatus === "success")
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({ success: true, total: payments.length, totalEarnings, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fixed: calculate earnings via seller's orders
export const getSellerEarnings = async (req, res) => {
  try {
    const sellerOrders = await Order.find({ seller: req.user.userId }).select("_id");
    const orderIds = sellerOrders.map((o) => o._id);

    const payments = await Payment.find({
      order: { $in: orderIds },
      paymentStatus: "success",
    });

    const totalEarnings = payments.reduce((acc, item) => acc + item.amount, 0);

    res.json({ success: true, totalEarnings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
