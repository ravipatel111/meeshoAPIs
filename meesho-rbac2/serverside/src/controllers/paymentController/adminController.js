import Payment from "../../models/paymentModel.js";

export const getAllPayments = async (req, res) => {
  try {
    const query = {};
    if (req.user && req.user.adminRole === "admin") {
      const Order = (await import("../../models/orderModel.js")).default;
      const orderIds = await Order.find({ seller: req.user.adminId }).distinct("_id");
      query.order = { $in: orderIds };
    }

    const payments = await Payment.find(query)
      .populate("user", "username email profileImage")
      .populate("order");

    res.json({ success: true, payments });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "status is required" });
    }

    let payment = await Payment.findById(req.params.id).populate("order");

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Check ownership for sub-admins
    if (req.user && req.user.adminRole === "admin" && String(payment.order?.seller) !== String(req.user.adminId)) {
      return res.status(403).json({ success: false, message: "Access denied. You can only manage payments for your own orders." });
    }

    payment.paymentStatus = status;
    await payment.save();

    res.json({ success: true, payment });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRevenue = async (req, res) => {
  try {
    const matchQuery = { paymentStatus: "success" };
    if (req.user && req.user.adminRole === "admin") {
      const Order = (await import("../../models/orderModel.js")).default;
      const orderIds = await Order.find({ seller: req.user.adminId }).distinct("_id");
      matchQuery.order = { $in: orderIds };
    }

    const revenue = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    res.json({ success: true, revenue: revenue[0]?.totalRevenue || 0 });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
