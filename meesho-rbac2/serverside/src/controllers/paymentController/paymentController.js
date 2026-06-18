import Payment from "../../models/paymentModel.js";
import Order from "../../models/orderModel.js";

export const createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    if (!orderId || !paymentMethod) {
      return res
        .status(400)
        .json({
          success: false,
          message: "orderId and paymentMethod are required",
        });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const payment = await Payment.create({
      order: orderId,
      user: req.user.userId,
      amount: order.totalPrice,
      paymentMethod,
      paymentStatus: "success",
      transactionId: "TXN" + Date.now(),
    });

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "paid",
      orderStatus: "confirmed",
    });

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.userId })
      .populate("order")
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Seller-specific admin payment query disabled for admin-user only mode
// Admin: get all payments of a particular seller by sellerId
export const getSellerPaymentsById = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const sellerOrders = await Order.find({ seller: sellerId }).select("_id");

    if (!sellerOrders.length) {
      return res.json({ success: true, total: 0, totalEarnings: 0, payments: [] });
    }

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
*/
