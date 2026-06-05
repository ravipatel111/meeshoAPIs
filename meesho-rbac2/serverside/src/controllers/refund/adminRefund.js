import Refund from "../../models/refundModel.js";
import Payment from "../../models/paymentModel.js";
import Order from "../../models/orderModel.js";

export const getAllRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find()
      .populate("user", "username email")
      .populate("order")
      .populate("payment")
      .sort({ createdAt: -1 });

    res.json({ success: true, refunds });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processRefund = async (req, res) => {
  try {
    const refund = await Refund.findByIdAndUpdate(
      req.params.id,
      { refundStatus: "completed" },
      { new: true }
    );

    if (!refund) {
      return res.status(404).json({ success: false, message: "Refund not found" });
    }

    await Payment.findByIdAndUpdate(refund.payment, { paymentStatus: "refunded" });
    await Order.findByIdAndUpdate(refund.order, { orderStatus: "cancelled" });

    res.json({ success: true, refund });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRefundStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "status is required" });
    }

    const refund = await Refund.findByIdAndUpdate(
      req.params.id,
      { refundStatus: status },
      { new: true }
    );

    if (!refund) {
      return res.status(404).json({ success: false, message: "Refund not found" });
    }

    res.json({ success: true, refund });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
