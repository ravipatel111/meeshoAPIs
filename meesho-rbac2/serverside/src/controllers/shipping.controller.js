import Product from "../models/productModels.js";
import Warehouse from "../models/Warehouse.js";
import shiprocketService from "../services/shiprocket.service.js";
import mapsService from "../services/maps.service.js";

export const checkShipping = async (req, res) => {
  try {
    const { productId, pincode } = req.body;

    if (!productId || !pincode) {
      return res.status(400).json({ success: false, message: "productId and pincode are required" });
    }

    // 1. Find Product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 2. Find Warehouse
    if (!product.warehouseId) {
      return res.status(400).json({ success: false, message: "Product is not assigned to a warehouse" });
    }
    const warehouse = await Warehouse.findById(product.warehouseId);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: "Warehouse not found" });
    }

    // 3. Call Shiprocket Serviceability API
    // Assuming weight = 1kg and COD = true for dummy call
    const shiprocketStatus = await shiprocketService.checkServiceability(
      warehouse.pincode,
      pincode,
      true,
      1
    );

    if (!shiprocketStatus || !shiprocketStatus.available) {
      return res.status(200).json({
        success: true,
        data: {
          available: false,
          message: "Delivery not available to this pincode"
        }
      });
    }

    // 4. Call Google Maps for exact distance and ETA (Fallback to Shiprocket ETA if Maps fails)
    let distanceInfo = "N/A";
    let deliveryDate = shiprocketStatus.deliveryDate;
    
    // Convert Customer Pincode to Lat/Lng
    const customerCoords = await mapsService.getCoordinates(pincode, "");
    
    if (customerCoords && warehouse.latitude && warehouse.longitude) {
      const distanceData = await mapsService.calculateDistance(
        warehouse.latitude,
        warehouse.longitude,
        customerCoords.lat,
        customerCoords.lng
      );
      
      if (distanceData) {
        distanceInfo = distanceData.distance;
        const days = mapsService.calculateETA(distanceData.distanceValue / 1000);
        deliveryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toDateString();
      }
    }

    // 5. Return Result
    return res.status(200).json({
      success: true,
      data: {
        available: true,
        shippingCharge: shiprocketStatus.shippingCharge || 0,
        deliveryDate: deliveryDate,
        distance: distanceInfo
      }
    });

  } catch (error) {
    console.error("checkShipping error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
