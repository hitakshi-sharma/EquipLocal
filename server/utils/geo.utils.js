/**
 * Geolocation & GPS Utilities for EquipLocal
 * Provides Haversine distance calculation, city coordinate fallbacks, and GPS matching helpers.
 */

// Coordinates for Delhi NCR cities and regions
export const CITY_COORDINATES = {
  Delhi: { lat: 28.6139, lng: 77.2090 },
  Noida: { lat: 28.5355, lng: 77.3910 },
  Faridabad: { lat: 28.4089, lng: 77.3178 },
  Ghaziabad: { lat: 28.6692, lng: 77.4538 },
  Gurgaon: { lat: 28.4595, lng: 77.0266 },
};

/**
 * Calculate the great-circle distance between two GPS coordinates using the Haversine Formula.
 * Returns distance in kilometers (km) rounded to 1 decimal place.
 *
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const p1Lat = Number(lat1);
  const p1Lon = Number(lon1);
  const p2Lat = Number(lat2);
  const p2Lon = Number(lon2);

  if (
    isNaN(p1Lat) ||
    isNaN(p1Lon) ||
    isNaN(p2Lat) ||
    isNaN(p2Lon) ||
    p1Lat < -90 ||
    p1Lat > 90 ||
    p2Lat < -90 ||
    p2Lat > 90
  ) {
    return null;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = (p2Lat - p1Lat) * (Math.PI / 180);
  const dLon = (p2Lon - p1Lon) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1Lat * (Math.PI / 180)) *
      Math.cos(p2Lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
};

/**
 * Get coordinates for a given city string or fallback to Delhi
 * @param {string} location
 * @returns {{ latitude: number, longitude: number }}
 */
export const getCoordinatesForLocation = (location = '') => {
  const normalized = String(location).trim().toLowerCase();

  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (normalized.includes(city.toLowerCase())) {
      return { latitude: coords.lat, longitude: coords.lng };
    }
  }

  // Default to Delhi center
  return { latitude: 28.6139, longitude: 77.2090 };
};

export default {
  CITY_COORDINATES,
  calculateDistance,
  getCoordinatesForLocation,
};
