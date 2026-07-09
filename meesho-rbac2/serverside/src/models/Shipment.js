import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  shipmentId: {
    type: String,
  },
  awb: {
    type: String,
  },
  courier: {
    type: String,
  },
  trackingUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Packed', 'Shipped', 'In Transit', 'Out For Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  estimatedDelivery: {
    type: Date,
  },
  pickupDate: {
    type: Date,
  }
}, { timestamps: true });

const Shipment = mongoose.model("Shipment", shipmentSchema);
export default Shipment;
