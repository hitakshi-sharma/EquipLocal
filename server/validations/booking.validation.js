import Joi from 'joi';

// create booking request validation schema
export const createBookingValidation = Joi.object({
  equipmentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid equipment ID format',
      'any.required': 'Equipment ID is required',
    }),
  startDate: Joi.date().iso().required().messages({
    'date.base': 'Please provide a valid start date',
    'any.required': 'Start date is required',
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
    'date.min': 'End date cannot be earlier than start date',
    'date.base': 'Please provide a valid end date',
    'any.required': 'End date is required',
  }),
});

// update booking status validation schema
export const updateBookingStatusValidation = Joi.object({
  status: Joi.string()
    .valid('accepted', 'rejected', 'completed', 'cancelled')
    .required()
    .messages({
      'any.only': 'Status must be accepted, rejected, completed, or cancelled',
      'any.required': 'Status is required',
    }),
});

export default {
  createBookingValidation,
  updateBookingStatusValidation,
};
