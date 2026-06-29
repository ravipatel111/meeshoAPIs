import Refund from "../../models/refundModel.js";
import Payment from "../../models/paymentModel.js";
import Order from "../../models/orderModel.js";

export const getAllRefunds = async (req, res) => {
  try {
    const query = {};
    if (req.user && req.user.adminRole === "admin") {
      query.seller = req.user.adminId;
    }

    const refunds = await Refund.find(query)
      .populate("user", "username email profileImage")
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
    let refund = await Refund.findById(req.params.id);

    if (!refund) {
      return res.status(404).json({ success: false, message: "Refund not found" });
    }

    // Check ownership for sub-admins
    if (req.user && req.user.adminRole === "admin" && String(refund.seller) !== String(req.user.adminId)) {
      return res.status(403).json({ success: false, message: "Access denied. You can only manage refunds for your own sales." });
    }

    refund.refundStatus = "completed";
    await refund.save();

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

    let refund = await Refund.findById(req.params.id);

    if (!refund) {
      return res.status(404).json({ success: false, message: "Refund not found" });
    }

    // Check ownership for sub-admins
    if (req.user && req.user.adminRole === "admin" && String(refund.seller) !== String(req.user.adminId)) {
      return res.status(403).json({ success: false, message: "Access denied. You can only manage refunds for your own sales." });
    }

    refund.refundStatus = status;
    await refund.save();

    res.json({ success: true, refund });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
