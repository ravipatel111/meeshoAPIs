import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  quantity: {
    type: Number,
    default: 1
  },

  totalPrice: {
    type: Number,
    required: true
  },

  // Delivery address — stored as a snapshot so it doesn't change if user edits address later
  deliveryAddress: {
    fullName:    { type: String, required: true },
    mobile:      { type: String, required: true },
    addressLine: { type: String, required: true },
    landmark:    { type: String, default: "" },
    city:        { type: String, required: true },
    state:       { type: String, required: true },
    pincode:     { type: String, required: true },
    addressType: { type: String, default: "home" },
  },

  orderStatus: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending"
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },

  dispute: {
    type: Boolean,
    default: false
  },

  disputeReason: {
    type: String,
    default: ""
  }

},
{ timestamps: true }
);

export default mongoose.model("Order", orderSchema);
