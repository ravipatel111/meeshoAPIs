import Order from "../../models/orderModel.js";

const VALID_ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"];

export const getAllOrders = async (req, res) => {
  try {
    const query = {};
    if (req.user && req.user.adminRole === "admin") {
      query.seller = req.user.adminId;
    }

    const orders = await Order.find(query)
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

    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check ownership for sub-admins
    if (req.user && req.user.adminRole === "admin" && String(order.seller) !== String(req.user.adminId)) {
      return res.status(403).json({ success: false, message: "Access denied. You can only manage your own orders." });
    }

    order.orderStatus = status;
    await order.save();

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
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check ownership for sub-admins
    if (req.user && req.user.adminRole === "admin" && String(order.seller) !== String(req.user.adminId)) {
      return res.status(403).json({ success: false, message: "Access denied. You can only manage your own orders." });
    }

    order.dispute = false;
    order.disputeReason = "";
    await order.save();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
