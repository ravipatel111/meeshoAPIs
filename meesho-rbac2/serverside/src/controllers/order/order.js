import Address from "../../models/addressModel.js";
import Order from "../../models/orderModel.js";
import Product from "../../models/productModels.js";
import User from "../../models/userModel.js";
import Payment from "../../models/paymentModel.js";

export const createOrder = async (req, res) => {
  try {
    const { product, quantity, addressId, paymentMethod, variantId } = req.body;

    if (!product || !quantity || !addressId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "product, quantity, addressId and paymentMethod are required",
      });
    }

    const productData = await Product.findById(product);
    if (!productData) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let selectedVariant = null;
    let price = productData.price;

    if (variantId) {
      selectedVariant = productData.variants.id(variantId);
      if (!selectedVariant) {
        return res.status(404).json({ success: false, message: "Variant not found" });
      }
      if (selectedVariant.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${selectedVariant.stock} item(s) available in stock for this variant`,
        });
      }
      price = selectedVariant.price;
    } else {
      // Fix: check stock availability before placing order
      if (productData.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${productData.stock} item(s) available in stock`,
        });
      }
    }

    const addressData = await Address.findOne({ _id: addressId, user: req.user.userId });
    if (!addressData) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const userData = await User.findById(req.user.userId).select("-password");
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const deliveryAddress = {
      fullName: addressData.fullName,
      mobile: addressData.mobile,
      addressLine: addressData.addressLine,
      landmark: addressData.landmark || "",
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      addressType: addressData.addressType,
    };

    const totalPrice = price * quantity;

    // Fix: decrement stock atomically to prevent overselling
    let updatedProduct;
    if (variantId) {
      updatedProduct = await Product.findOneAndUpdate(
        { _id: product, "variants._id": variantId, "variants.stock": { $gte: quantity } },
        { $inc: { "variants.$.stock": -quantity } },
        { new: true }
      );
    } else {
      updatedProduct = await Product.findOneAndUpdate(
        { _id: product, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );
    }

    if (!updatedProduct) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock. Please try again.",
      });
    }

    const orderData = {
      user: req.user.userId,
      seller: productData.seller,
      product,
      quantity,
      totalPrice,
      deliveryAddress,
      paymentStatus: "pending",
      orderStatus: "pending",
    };

    if (selectedVariant) {
      orderData.variant = variantId;
      orderData.size = selectedVariant.size;
      if (selectedVariant.color) {
        orderData.color = selectedVariant.color;
      }
    }

    const order = await Order.create(orderData);

    const payment = await Payment.create({
      order: order._id,
      user: req.user.userId,
      amount: totalPrice,
      paymentMethod,
      paymentStatus: "success",
      transactionId: "TXN" + Date.now(),
    });

    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: "paid",
      orderStatus: "confirmed",
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("product", "title price images")
      .populate("seller", "name email")
      .populate("user", "username email mobile");

    res.status(201).json({
      success: true,
      order: populatedOrder,
      payment,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .populate("product", "title price images")
      .populate("seller", "name email")
      .populate("user", "username email mobile")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.userId })
      .populate("product", "title price images")
      .populate("user", "username email mobile")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.orderStatus}`,
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ success: false, message: "Order is already cancelled" });
    }

    // Fix: restore stock when order is cancelled
    if (order.variant) {
      await Product.findOneAndUpdate(
        { _id: order.product, "variants._id": order.variant },
        { $inc: { "variants.$.stock": order.quantity } }
      );
    } else {
      await Product.findByIdAndUpdate(order.product, {
        $inc: { stock: order.quantity },
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully", order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const raiseDispute = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: "reason is required" });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.dispute = true;
    order.disputeReason = reason;
    await order.save();

    res.json({ success: true, order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
