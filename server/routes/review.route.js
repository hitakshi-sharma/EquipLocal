import express from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createReviewValidation } from '../validations/review.validation.js';

const router = express.Router();

// Get reviews for equipment
router.get('/equipment/:equipmentId', reviewController.getEquipmentReviews);

// Add or update review for equipment
router.post(
  '/equipment/:equipmentId',
  authenticate,
  validate(createReviewValidation),
  reviewController.createReview
);

// Delete review
router.delete('/:reviewId', authenticate, reviewController.deleteReview);

export default router;
