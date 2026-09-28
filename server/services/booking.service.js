import Booking from '../models/Booking.js';
import Equipment from '../models/Equipment.js';
import AppError from '../utils/AppError.js';

// Create a new booking request for equipment
export const createBooking = async (renterId, payload) => {
  const { equipmentId, startDate, endDate } = payload;

  // Find equipment in database
  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) {
    throw new AppError('Equipment not found', 404);
  }

  // Check if equipment is available for rent
  if (!equipment.availability) {
    throw new AppError('This equipment is currently marked as unavailable', 400);
  }

  // Prevent owner from booking their own equipment
  if (equipment.ownerId.toString() === renterId.toString()) {
    throw new AppError('You cannot book your own equipment', 400);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate start date is not in the past
  const startStr = start.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];
  if (startStr < todayStr) {
    throw new AppError('Start date cannot be in the past', 400);
  }

  // Validate end date is equal to or after start date
  if (end < start) {
    throw new AppError('End date cannot be earlier than start date', 400);
  }

  // Check if equipment is already booked for overlapping dates
  const conflictingBooking = await Booking.findOne({
    equipmentId: equipment._id,
    status: 'accepted',
    startDate: { $lte: end },
    endDate: { $gte: start },
  });

  if (conflictingBooking) {
    throw new AppError('This equipment is already booked for the selected dates', 400);
  }

  // Calculate rental days and total amount with deposit
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalAmount = diffDays * equipment.pricePerDay + (equipment.securityDeposit || 0);

  // Save new booking record
  const booking = await Booking.create({
    equipmentId: equipment._id,
    renterId,
    ownerId: equipment.ownerId,
    startDate: start,
    endDate: end,
    totalAmount,
    status: 'pending',
  });

  // Return populated booking
  const populated = await Booking.findById(booking._id)
    .populate('equipmentId')
    .populate('ownerId', 'name email phone location profileImage')
    .populate('renterId', 'name email phone location profileImage');

  return {
    message: 'Booking request submitted successfully',
    data: populated,
  };
};

// Get all bookings made by the renter
export const getMyBookings = async (renterId) => {
  const bookings = await Booking.find({ renterId })
    .populate('equipmentId')
    .populate('ownerId', 'name email phone location profileImage')
    .sort({ createdAt: -1 });

  return {
    message: 'My bookings fetched successfully',
    data: bookings,
  };
};

// Get all incoming booking requests for the owner
export const getOwnerBookings = async (ownerId) => {
  const bookings = await Booking.find({ ownerId })
    .populate('equipmentId')
    .populate('renterId', 'name email phone location profileImage')
    .sort({ createdAt: -1 });

  return {
    message: 'Owner booking requests fetched successfully',
    data: bookings,
  };
};

// Accept a booking request (owner only)
export const acceptBooking = async (bookingId, ownerId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Verify owner authorization
  if (booking.ownerId.toString() !== ownerId.toString()) {
    throw new AppError('Not authorized to accept this booking', 403);
  }

  // Only pending bookings can be accepted
  if (booking.status !== 'pending') {
    throw new AppError(`Cannot accept a booking with status '${booking.status}'`, 400);
  }

  // Check for any other overlapping accepted booking
  const overlappingAccepted = await Booking.findOne({
    _id: { $ne: booking._id },
    equipmentId: booking.equipmentId,
    status: 'accepted',
    startDate: { $lte: booking.endDate },
    endDate: { $gte: booking.startDate },
  });

  if (overlappingAccepted) {
    throw new AppError('Another booking has already been accepted for these dates', 400);
  }

  // Mark this booking as accepted
  booking.status = 'accepted';
  await booking.save();

  // Auto-reject any other pending requests for the same dates
  await Booking.updateMany(
    {
      _id: { $ne: booking._id },
      equipmentId: booking.equipmentId,
      status: 'pending',
      startDate: { $lte: booking.endDate },
      endDate: { $gte: booking.startDate },
    },
    { status: 'rejected' }
  );

  const updated = await Booking.findById(booking._id)
    .populate('equipmentId')
    .populate('renterId', 'name email phone location profileImage');

  return {
    message: 'Booking accepted successfully',
    data: updated,
  };
};

// Reject a booking request (owner only)
export const rejectBooking = async (bookingId, ownerId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Verify owner authorization
  if (booking.ownerId.toString() !== ownerId.toString()) {
    throw new AppError('Not authorized to reject this booking', 403);
  }

  // Only pending bookings can be rejected
  if (booking.status !== 'pending') {
    throw new AppError(`Cannot reject a booking with status '${booking.status}'`, 400);
  }

  booking.status = 'rejected';
  await booking.save();

  const updated = await Booking.findById(booking._id)
    .populate('equipmentId')
    .populate('renterId', 'name email phone location profileImage');

  return {
    message: 'Booking rejected successfully',
    data: updated,
  };
};

// Cancel a booking request (renter only)
export const cancelBooking = async (bookingId, renterId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Verify renter authorization
  if (booking.renterId.toString() !== renterId.toString()) {
    throw new AppError('Not authorized to cancel this booking', 403);
  }

  // Completed or rejected bookings cannot be cancelled
  if (booking.status === 'completed' || booking.status === 'rejected' || booking.status === 'cancelled') {
    throw new AppError(`Cannot cancel a booking that is ${booking.status}`, 400);
  }

  booking.status = 'cancelled';
  await booking.save();

  const updated = await Booking.findById(booking._id)
    .populate('equipmentId')
    .populate('ownerId', 'name email phone location profileImage');

  return {
    message: 'Booking cancelled successfully',
    data: updated,
  };
};

export default {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  acceptBooking,
  rejectBooking,
  cancelBooking,
};
