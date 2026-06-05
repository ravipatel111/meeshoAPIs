import Refund from "../../models/refundModel.js";
import Order from "../../models/orderModel.js";
import Payment from "../../models/paymentModel.js";

export const requestRefund = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    if (!orderId || !reason) {
      return res.status(400).json({ success: false, message: "orderId and reason are required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const payment = await Payment.findOne({ order: orderId });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found for this order" });
    }

    const refund = await Refund.create({
      order: orderId,
      payment: payment._id,
      user: req.user.userId,
      amount: payment.amount,
      reason,
    });

    res.json({ success: true, refund });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find({ user: req.user.userId })
      .populate("order")
      .populate("payment");

    res.json({ success: true, refunds });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
