import Order from "../models/orderModel.js";
import Shipment from "../models/Shipment.js";
import shiprocketService from "../services/shiprocket.service.js";

export const getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params; // orderId

    // 1. Validate Order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 2. Find associated Shipment
    const shipment = await Shipment.findOne({ orderId: id });
    if (!shipment) {
      return res.status(404).json({ 
        success: false, 
        message: "Shipment details not yet generated for this order" 
      });
    }

    // 3. If there is a Shiprocket shipment ID, fetch live tracking
    if (shipment.shipmentId && shipment.awb) {
      const trackingInfo = await shiprocketService.trackShipment(shipment.awb);
      
      // Update local shipment status if it has changed
      if (trackingInfo && trackingInfo.status !== shipment.status) {
        shipment.status = trackingInfo.status;
        await shipment.save();
      }

      return res.status(200).json({
        success: true,
        data: {
          status: shipment.status,
          awb: shipment.awb,
          courier: shipment.courier,
          trackingUrl: shipment.trackingUrl,
          estimatedDelivery: shipment.estimatedDelivery || trackingInfo.expectedDelivery,
          liveTrackingData: trackingInfo // raw data from shiprocket
        }
      });
    }

    // Fallback if no shipment ID was synced
    return res.status(200).json({
      success: true,
      data: {
        status: shipment.status,
        message: "Awaiting courier assignment"
      }
    });

  } catch (error) {
    console.error("getOrderTracking error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
