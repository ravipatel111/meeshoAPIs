import axios from "axios";

class ShiprocketService {
  constructor() {
    this.email = process.env.SHIPROCKET_EMAIL;
    this.password = process.env.SHIPROCKET_PASSWORD;
    this.token = null;
    this.baseUrl = 'https://apiv2.shiprocket.in/v1/external';
  }

  async login() {
    try {
      if (!this.email || !this.password) return null;
      
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        email: this.email,
        password: this.password
      });
      
      this.token = response.data.token;
      return this.token;
    } catch (error) {
      console.error('Shiprocket Login Error:', error.message);
      return null;
    }
  }

  async checkServiceability(pickup_postcode, delivery_postcode, cod, weight) {
    if (!this.token) await this.login();
    
    try {
      const response = await axios.get(`${this.baseUrl}/courier/serviceability/`, {
        params: {
          pickup_postcode,
          delivery_postcode,
          weight,
          cod: cod ? 1 : 0
        },
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });

      const data = response.data.data;
      if (data && data.available_courier_companies && data.available_courier_companies.length > 0) {
        // Find the most optimal courier (usually cheapest or fastest)
        // We'll pick the first available one for now
        const courier = data.available_courier_companies[0];
        
        return {
          available: true,
          shippingCharge: courier.rate,
          deliveryDate: courier.estimated_delivery_date
        };
      }
      
      return { available: false };
    } catch (error) {
      console.error('Shiprocket Serviceability Error:', error.response?.data || error.message);
      return { available: false };
    }
  }

  async createShipment(orderData) {
    if (!this.token) await this.login();
    
    try {
      // Shiprocket expects a specific payload format for creating an order
      const response = await axios.post(`${this.baseUrl}/orders/create/ad-hoc`, orderData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`
        }
      });
      
      return {
        success: true,
        orderId: response.data.order_id,
        shipmentId: response.data.shipment_id,
        awb: response.data.awb_code || null,
        data: response.data
      };
    } catch (error) {
      console.error('Shiprocket Create Order Error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async trackShipment(awb_code) {
    if (!this.token) await this.login();
    
    try {
      const response = await axios.get(`${this.baseUrl}/courier/track/awb/${awb_code}`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      
      const trackingData = response.data.tracking_data;
      
      if (!trackingData) {
         return { success: false, message: "Tracking data not found" };
      }
      
      return {
        success: true,
        currentStatus: trackingData.shipment_status === 7 ? 'Delivered' : 'In Transit', // 7 is typically delivered
        statusDetails: trackingData.track_status === 1 ? 'Tracking Active' : 'Pending',
        expectedDelivery: trackingData.etd,
        trackingUrl: trackingData.track_url,
        activities: trackingData.shipment_track_activities
      };
    } catch (error) {
      console.error('Shiprocket Tracking Error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }
}

export default new ShiprocketService();
