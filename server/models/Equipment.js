import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add equipment name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Construction',
        'Agriculture',
        'Event',
        'Cleaning',
        'Power Tools',
        'Transportation',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Please add price per day'],
      min: [0, 'Price must be positive'],
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: [0, 'Deposit must be non-negative'],
    },
    location: {
      type: String,
      required: [true, 'Please add equipment location'],
      trim: true,
    },
    // Real-Time GPS Coordinates (GeoJSON Point format: [lng, lat])
    locationCoordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.209, 28.6139],
      },
    },
    latitude: {
      type: Number,
      default: 28.6139,
    },
    longitude: {
      type: Number,
      default: 77.209,
    },
    image: {
      type: String,
      default: '/images/default-equipment.jpg',
    },
    availability: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Total reviews cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for high performance geospatial queries
equipmentSchema.index({ locationCoordinates: '2dsphere' });

const Equipment = mongoose.model('Equipment', equipmentSchema);
export default Equipment;
