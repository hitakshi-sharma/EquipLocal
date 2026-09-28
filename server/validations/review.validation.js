import Joi from 'joi';

export const createReviewValidation = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'any.required': 'Rating is required',
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1 star',
    'number.max': 'Rating cannot exceed 5 stars',
  }),
  comment: Joi.string().min(3).max(1000).required().trim().messages({
    'any.required': 'Review comment is required',
    'string.empty': 'Review comment cannot be empty',
    'string.min': 'Review comment must be at least 3 characters long',
    'string.max': 'Review comment cannot exceed 1000 characters',
  }),
});
