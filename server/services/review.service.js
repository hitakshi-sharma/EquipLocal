import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Equipment from '../models/Equipment.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

// Recalculate averageRating and totalReviews for an equipment
export const updateEquipmentRatingStats = async (equipmentId) => {
  const objectId = new mongoose.Types.ObjectId(equipmentId);

  const stats = await Review.aggregate([
    { $match: { equipmentId: objectId } },
    {
      $group: {
        _id: '$equipmentId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating =
    stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;
  const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

  await Equipment.findByIdAndUpdate(equipmentId, {
    averageRating,
    totalReviews,
  });

  return { averageRating, totalReviews };
};

// Get all reviews for a specific equipment listing
export const getEquipmentReviews = async (equipmentId) => {
  if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
    throw new AppError('Invalid equipment ID', 400);
  }

  const equipment = await Equipment.findById(equipmentId).select(
    'name averageRating totalReviews ownerId'
  );
  if (!equipment) {
    throw new AppError('Equipment listing not found', 404);
  }

  const reviews = await Review.find({ equipmentId })
    .populate('userId', 'name profileImage role location')
    .sort({ createdAt: -1 });

  // Calculate rating breakdown distribution
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((rev) => {
    const star = Math.min(5, Math.max(1, Math.round(rev.rating)));
    breakdown[star] = (breakdown[star] || 0) + 1;
  });

  return {
    message: 'Reviews fetched successfully',
    data: {
      reviews,
      averageRating: equipment.averageRating || 0,
      totalReviews: equipment.totalReviews || reviews.length,
      breakdown,
    },
  };
};

// Create or update review for an equipment
export const createOrUpdateReview = async (equipmentId, userId, payload) => {
  if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
    throw new AppError('Invalid equipment ID', 400);
  }

  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) {
    throw new AppError('Equipment listing not found', 404);
  }

  // Prevent equipment owner from reviewing their own machine
  if (equipment.ownerId.toString() === userId.toString()) {
    throw new AppError('Equipment owners cannot review their own listings', 403);
  }

  const { rating, comment } = payload;

  const review = await Review.findOneAndUpdate(
    { equipmentId, userId },
    { rating: Number(rating), comment: comment.trim() },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).populate('userId', 'name profileImage role location');

  // Recalculate rating stats on equipment
  const { averageRating, totalReviews } = await updateEquipmentRatingStats(equipmentId);

  return {
    message: 'Review submitted successfully',
    data: {
      review,
      averageRating,
      totalReviews,
    },
  };
};

// Delete review
export const deleteReview = async (equipmentId, reviewId, userId, userRole) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new AppError('Invalid review ID', 400);
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError('Review not found', 404);
  }

  // Verify authorization: author or admin
  const isAuthor = review.userId.toString() === userId.toString();
  const isAdmin = userRole === 'admin';

  if (!isAuthor && !isAdmin) {
    throw new AppError('You are not authorized to delete this review', 403);
  }

  const targetEquipmentId = equipmentId || review.equipmentId;
  await Review.findByIdAndDelete(reviewId);

  // Recalculate stats
  const { averageRating, totalReviews } = await updateEquipmentRatingStats(targetEquipmentId);

  return {
    message: 'Review deleted successfully',
    data: {
      reviewId,
      averageRating,
      totalReviews,
    },
  };
};
