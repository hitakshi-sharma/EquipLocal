import * as reviewService from '../services/review.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

// Get reviews for equipment
export const getEquipmentReviews = asyncHandler(async (req, res) => {
  const equipmentId = req.params.equipmentId || req.params.id;
  const result = await reviewService.getEquipmentReviews(equipmentId);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// Create or update review for equipment
export const createReview = asyncHandler(async (req, res) => {
  const equipmentId = req.params.equipmentId || req.params.id;
  const userId = req.user.userId || req.user._id;

  const result = await reviewService.createOrUpdateReview(
    equipmentId,
    userId,
    req.body
  );

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 201,
  });
});

// Delete review
export const deleteReview = asyncHandler(async (req, res) => {
  const equipmentId = req.params.equipmentId || req.params.id;
  const reviewId = req.params.reviewId || req.params.id;
  const userId = req.user.userId || req.user._id;
  const userRole = req.user.role;

  const result = await reviewService.deleteReview(
    equipmentId,
    reviewId,
    userId,
    userRole
  );

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});
