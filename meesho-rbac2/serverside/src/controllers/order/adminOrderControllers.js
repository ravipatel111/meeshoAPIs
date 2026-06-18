import Order from "../../models/orderModel.js";

const VALID_ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"];

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "username email mobile profileImage")
      .populate("seller", "name email")
      .populate("product", "title price images")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fix: validate status against enum before hitting DB
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "status is required" });
    }

    if (!VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(", ")}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { dispute: false, disputeReason: "" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
