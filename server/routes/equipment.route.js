import express from 'express';
import * as equipmentController from '../controllers/equipment.controller.js';
import * as reviewController from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  createEquipmentValidation,
  updateEquipmentValidation,
} from '../validations/equipment.validation.js';
import { createReviewValidation } from '../validations/review.validation.js';

const router = express.Router();

// Get all equipment listings
router.get('/', equipmentController.getEquipments);

// Create new equipment listing
router.post(
  '/',
  authenticate,
  validate(createEquipmentValidation),
  equipmentController.createEquipment
);

// Get equipment owned by current user
router.get('/owner/my', authenticate, equipmentController.getMyEquipments);

// Get single equipment details by id
router.get('/:id', equipmentController.getEquipmentById);

// Update existing equipment by id
router.put(
  '/:id',
  authenticate,
  validate(updateEquipmentValidation),
  equipmentController.updateEquipment
);

// Delete equipment by id
router.delete('/:id', authenticate, equipmentController.deleteEquipment);

// --- Equipment Reviews & Ratings ---
// Get all reviews for an equipment
router.get('/:id/reviews', reviewController.getEquipmentReviews);

// Add or update review for an equipment
router.post(
  '/:id/reviews',
  authenticate,
  validate(createReviewValidation),
  reviewController.createReview
);

// Delete review
router.delete('/:id/reviews/:reviewId', authenticate, reviewController.deleteReview);

export default router;

