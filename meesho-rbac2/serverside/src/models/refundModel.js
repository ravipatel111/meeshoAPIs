import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
{
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },

  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Fix: added seller field so sellerRefund.initiateRefund can store it
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },

  amount: {
    type: Number,
    required: true,
  },

  reason: {
    type: String,
    default: "",
  },

  refundStatus: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
  },
},
{ timestamps: true }
);

export default mongoose.model("Refund", refundSchema);
