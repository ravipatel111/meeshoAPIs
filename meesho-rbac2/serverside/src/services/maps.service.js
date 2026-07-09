import axios from "axios";

class MapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  async getCoordinates(pincode, address) {
    try {
      if (!this.apiKey) return { lat: 23.0225, lng: 72.5714 }; // Dummy Ahmedabad coords
      
      // Implement geocoding
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          address: `${address}, ${pincode}`,
          key: this.apiKey
        }
      });
      
      if (response.data.status === 'OK') {
        return response.data.results[0].geometry.location;
      }
      return null;
    } catch (error) {
      console.error('Google Maps Geocoding Error:', error.message);
      return null;
    }
  }

  async calculateDistance(originLat, originLng, destLat, destLng) {
    try {
      if (!this.apiKey) return { distance: '75 km', duration: '2 hours' }; // Dummy data
      
      // Implement Distance Matrix / Directions API
      const response = await axios.get(`${this.baseUrl}/distancematrix/json`, {
        params: {
          origins: `${originLat},${originLng}`,
          destinations: `${destLat},${destLng}`,
          key: this.apiKey
        }
      });
      
      if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
        const element = response.data.rows[0].elements[0];
        return {
          distance: element.distance.text,
          duration: element.duration.text,
          distanceValue: element.distance.value, // in meters
        };
      }
      return null;
    } catch (error) {
      console.error('Google Maps Distance Matrix Error:', error.message);
      return null;
    }
  }

  calculateETA(distanceInKm) {
    // Custom logic
    if (distanceInKm < 100) return 2; // 2 days
    if (distanceInKm < 500) return 4; // 4 days
    return 7; // 7 days
  }
}

export default new MapsService();
