import Payment from "../../models/paymentModel.js";

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "username email")
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

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: status },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    res.json({ success: true, payment });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRevenue = async (req, res) => {
  try {
    const revenue = await Payment.aggregate([
      { $match: { paymentStatus: "success" } },
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
