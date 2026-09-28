import * as bookingService from '../services/booking.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

// create a new booking request
export const createBooking = asyncHandler(async (req, res) => {
  const renterId = req.user.userId || req.user._id;
  const result = await bookingService.createBooking(renterId, req.body);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 201,
  });
});

// get all bookings of the logged-in renter
export const getMyBookings = asyncHandler(async (req, res) => {
  const renterId = req.user.userId || req.user._id;
  const result = await bookingService.getMyBookings(renterId);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// get all booking requests for the owner
export const getOwnerBookings = asyncHandler(async (req, res) => {
  const ownerId = req.user.userId || req.user._id;
  const result = await bookingService.getOwnerBookings(ownerId);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// accept a booking request
export const acceptBooking = asyncHandler(async (req, res) => {
  const ownerId = req.user.userId || req.user._id;
  const result = await bookingService.acceptBooking(req.params.id, ownerId);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// reject a booking request
export const rejectBooking = asyncHandler(async (req, res) => {
  const ownerId = req.user.userId || req.user._id;
  const result = await bookingService.rejectBooking(req.params.id, ownerId);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// cancel a booking request
export const cancelBooking = asyncHandler(async (req, res) => {
  const renterId = req.user.userId || req.user._id;
  const result = await bookingService.cancelBooking(req.params.id, renterId);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

export default {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  acceptBooking,
  rejectBooking,
  cancelBooking,
};
