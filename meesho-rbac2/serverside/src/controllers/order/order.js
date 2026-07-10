import Address from "../../models/addressModel.js";
import Order from "../../models/orderModel.js";
import Product from "../../models/productModels.js";
import User from "../../models/userModel.js";
import Payment from "../../models/paymentModel.js";
import Shipment from "../../models/Shipment.js";
import shiprocketService from "../../services/shiprocket.service.js";
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

    const isCOD = paymentMethod.toUpperCase() === "COD";

    const payment = await Payment.create({
      order: order._id,
      user: req.user.userId,
      amount: totalPrice,
      paymentMethod,
      paymentStatus: isCOD ? "pending" : "success",
      transactionId: isCOD ? undefined : "TXN" + Date.now(),
    });

    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: isCOD ? "pending" : "paid",
      orderStatus: "confirmed",
    });

    // --- SHIPROCKET INTEGRATION START ---
    try {
      const shiprocketPayload = {
        order_id: order._id.toString(),
        order_date: new Date().toISOString(),
        pickup_location: "Primary", // Or get from warehouse
        billing_customer_name: addressData.fullName || userData.username || "Customer",
        billing_last_name: "",
        billing_address: addressData.addressLine,
        billing_city: addressData.city,
        billing_pincode: addressData.pincode,
        billing_state: addressData.state,
        billing_country: "India",
        billing_email: userData.email || "noemail@example.com",
        billing_phone: addressData.mobile || userData.mobile || "0000000000",
        shipping_is_billing: true,
        order_items: [
          {
            name: productData.title,
            sku: productData._id.toString(),
            units: quantity,
            selling_price: price,
          }
        ],
        payment_method: paymentMethod === 'COD' ? 'COD' : 'Prepaid',
        sub_total: totalPrice,
        length: 10, // Default dimensions (can be updated from product data if available)
        breadth: 10,
        height: 10,
        weight: 1, // Default weight in kg
      };

      const shiprocketRes = await shiprocketService.createShipment(shiprocketPayload);
      
      if (shiprocketRes.success) {
        await Shipment.create({
          orderId: order._id,
          shipmentId: shiprocketRes.shipmentId,
          awb: shiprocketRes.awb,
          courier: "Pending Courier Assignment",
          status: "Pending",
          trackingUrl: "",
        });
      } else {
        console.error("Failed to create Shiprocket order:", shiprocketRes.error);
        // We let the order succeed locally even if Shiprocket sync fails so the user isn't blocked.
      }
    } catch (srError) {
      console.error("Shiprocket integration error:", srError);
    }
    // --- SHIPROCKET INTEGRATION END ---

    const populatedOrder = await Order.findById(order._id)
      .populate("product", "title price images")
      .populate("seller", "name email")
      .populate("user", "username email mobile profileImage");

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
      .populate("user", "username email mobile profileImage")
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
      .populate("user", "username email mobile profileImage")
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

export const returnOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.orderStatus !== "delivered") {
      return res.status(400).json({
        success: false,
        message: `Only delivered orders can be returned, currently it is ${order.orderStatus}`,
      });
    }

    // Restore inventory stock
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

    order.orderStatus = "returned";
    await order.save();

    res.json({ success: true, message: "Order returned successfully", order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
