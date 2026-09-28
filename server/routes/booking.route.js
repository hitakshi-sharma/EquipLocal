import express from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createBookingValidation } from '../validations/booking.validation.js';

const router = express.Router();

// create booking (renter)
router.post(
  '/',
  authenticate,
  validate(createBookingValidation),
  bookingController.createBooking
);

// list bookings
router.get('/my', authenticate, bookingController.getMyBookings);
router.get('/owner', authenticate, bookingController.getOwnerBookings);

// owner decisions
router.put('/:id/accept', authenticate, bookingController.acceptBooking);
router.put('/:id/reject', authenticate, bookingController.rejectBooking);

// renter cancellation
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

export default router;
