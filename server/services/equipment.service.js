import Equipment from '../models/Equipment.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import AppError from '../utils/AppError.js';
import { calculateDistance, getCoordinatesForLocation } from '../utils/geo.utils.js';

// Get all equipment with search, category, location, price, and real-time GPS proximity filters
export const getEquipments = async (filters = {}) => {
  const {
    category,
    location,
    search,
    minPrice,
    maxPrice,
    availability,
    lat,
    lng,
    radius,
    sortByDistance,
  } = filters;

  const query = {};

  // Filter by category
  if (category && category !== 'All') {
    query.category = category;
  }

  // Filter by location text if provided
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  // Search across name and description
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
  }

  // Filter by availability
  if (availability !== undefined && availability !== 'all') {
    query.availability = availability === 'true' || availability === true;
  }

  // Real-Time GPS Matching via MongoDB 2dsphere geospatial index
  const userLat = lat !== undefined && lat !== null && lat !== '' ? parseFloat(lat) : null;
  const userLng = lng !== undefined && lng !== null && lng !== '' ? parseFloat(lng) : null;
  const maxRadiusKm = radius ? parseFloat(radius) : 50;

  const hasUserGPS = !isNaN(userLat) && !isNaN(userLng) && userLat !== null && userLng !== null;

  if (hasUserGPS) {
    // MongoDB 2dsphere geospatial query: filters within radius directly at the database engine
    query.locationCoordinates = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [userLng, userLat], // GeoJSON format: [longitude, latitude]
        },
        $maxDistance: maxRadiusKm * 1000, // Distance in meters
      },
    };
  }

  // Filter by minimum rating
  if (filters.minRating) {
    query.averageRating = { $gte: Number(filters.minRating) };
  }

  let mongoQuery = Equipment.find(query).populate(
    'ownerId',
    'name email phone location profileImage'
  );

  // When $near is not active, apply sort
  if (!hasUserGPS) {
    if (filters.sort === 'rating-desc') {
      mongoQuery = mongoQuery.sort({ averageRating: -1, totalReviews: -1 });
    } else if (filters.sort === 'price-asc') {
      mongoQuery = mongoQuery.sort({ pricePerDay: 1 });
    } else if (filters.sort === 'price-desc') {
      mongoQuery = mongoQuery.sort({ pricePerDay: -1 });
    } else {
      mongoQuery = mongoQuery.sort({ createdAt: -1 });
    }
  }

  const rawEquipments = await mongoQuery;

  let processedEquipments = rawEquipments.map((doc) => {
    const item = doc.toObject();

    // Determine equipment coordinates (stored, GeoJSON, or city fallback)
    const equipLat =
      item.latitude ??
      item.locationCoordinates?.coordinates?.[1] ??
      getCoordinatesForLocation(item.location).latitude;
    const equipLng =
      item.longitude ??
      item.locationCoordinates?.coordinates?.[0] ??
      getCoordinatesForLocation(item.location).longitude;

    item.latitude = equipLat;
    item.longitude = equipLng;

    if (hasUserGPS) {
      item.distance = calculateDistance(userLat, userLng, equipLat, equipLng);
    }

    return item;
  });

  // If sorting explicitly by price or rating was requested, apply it
  if (hasUserGPS && filters.sort) {
    if (filters.sort === 'rating-desc') {
      processedEquipments.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (filters.sort === 'price-asc') {
      processedEquipments.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (filters.sort === 'price-desc') {
      processedEquipments.sort((a, b) => b.pricePerDay - a.pricePerDay);
    }
  }

  return {
    message: hasUserGPS
      ? `Found ${processedEquipments.length} equipment listings matched to your GPS within ${maxRadiusKm} km`
      : 'Equipment listings fetched successfully',
    data: processedEquipments,
    userLocation: hasUserGPS ? { lat: userLat, lng: userLng, radiusKm: maxRadiusKm } : null,
  };
};

// Get single equipment details by id with coordinates guaranteed
export const getEquipmentById = async (id) => {
  const equipment = await Equipment.findById(id).populate(
    'ownerId',
    'name email phone location profileImage'
  );

  if (!equipment) {
    throw new AppError('Equipment not found', 404);
  }

  const item = equipment.toObject();
  const equipLat =
    item.latitude ??
    item.locationCoordinates?.coordinates?.[1] ??
    getCoordinatesForLocation(item.location).latitude;
  const equipLng =
    item.longitude ??
    item.locationCoordinates?.coordinates?.[0] ??
    getCoordinatesForLocation(item.location).longitude;

  item.latitude = equipLat;
  item.longitude = equipLng;

  return {
    message: 'Equipment details fetched successfully',
    data: item,
  };
};

// Get all listings created by the logged-in owner
export const getMyEquipments = async (ownerId) => {
  const equipments = await Equipment.find({ ownerId }).sort({ createdAt: -1 });

  return {
    message: 'My equipment listings fetched successfully',
    data: equipments,
  };
};

// Create a new equipment listing with GPS coordinates
export const createEquipment = async (ownerId, payload) => {
  const {
    name,
    category,
    description,
    pricePerDay,
    securityDeposit,
    location,
    latitude,
    longitude,
    image,
    availability,
  } = payload;

  let lat = latitude !== undefined && latitude !== null && latitude !== '' ? Number(latitude) : null;
  let lng = longitude !== undefined && longitude !== null && longitude !== '' ? Number(longitude) : null;

  if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
    const fallback = getCoordinatesForLocation(location);
    lat = fallback.latitude;
    lng = fallback.longitude;
  }

  const equipment = await Equipment.create({
    ownerId,
    name,
    category,
    description,
    pricePerDay: Number(pricePerDay),
    securityDeposit: securityDeposit ? Number(securityDeposit) : 0,
    location,
    latitude: lat,
    longitude: lng,
    locationCoordinates: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    image: image || undefined,
    availability: availability !== undefined ? availability : true,
  });

  return {
    message: 'Equipment listing created successfully',
    data: equipment,
  };
};

// Update an existing equipment listing (owner only)
export const updateEquipment = async (id, ownerId, payload) => {
  const equipment = await Equipment.findById(id);

  if (!equipment) {
    throw new AppError('Equipment not found', 404);
  }

  // Verify owner permission
  if (equipment.ownerId.toString() !== ownerId.toString()) {
    throw new AppError('You do not have permission to modify this equipment', 403);
  }

  const updates = { ...payload };

  if (payload.pricePerDay !== undefined) updates.pricePerDay = Number(payload.pricePerDay);
  if (payload.securityDeposit !== undefined) updates.securityDeposit = Number(payload.securityDeposit);

  // Synchronize GPS coordinates if provided or if location updated
  if (payload.latitude !== undefined && payload.longitude !== undefined) {
    const lat = Number(payload.latitude);
    const lng = Number(payload.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      updates.latitude = lat;
      updates.longitude = lng;
      updates.locationCoordinates = {
        type: 'Point',
        coordinates: [lng, lat],
      };
    }
  } else if (payload.location && payload.location !== equipment.location) {
    const fallback = getCoordinatesForLocation(payload.location);
    updates.latitude = fallback.latitude;
    updates.longitude = fallback.longitude;
    updates.locationCoordinates = {
      type: 'Point',
      coordinates: [fallback.longitude, fallback.latitude],
    };
  }

  const updated = await Equipment.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  return {
    message: 'Equipment updated successfully',
    data: updated,
  };
};

// Delete an equipment listing (owner only)
export const deleteEquipment = async (id, ownerId) => {
  const equipment = await Equipment.findById(id);

  if (!equipment) {
    throw new AppError('Equipment not found', 404);
  }

  // Verify owner permission
  if (equipment.ownerId.toString() !== ownerId.toString()) {
    throw new AppError('You do not have permission to delete this equipment', 403);
  }

  // Check for active or pending bookings
  const activeBookings = await Booking.find({
    equipmentId: id,
    status: { $in: ['pending', 'accepted'] },
  });

  if (activeBookings.length > 0) {
    throw new AppError('Cannot delete equipment with active or pending bookings', 400);
  }

  await equipment.deleteOne();

  return {
    message: 'Equipment removed successfully',
    data: null,
  };
};

export default {
  getEquipments,
  getEquipmentById,
  getMyEquipments,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
