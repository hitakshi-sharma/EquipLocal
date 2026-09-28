import Joi from 'joi';

// create equipment validation schema
export const createEquipmentValidation = Joi.object({
  name: Joi.string().min(3).max(120).required().trim().messages({
    'any.required': 'Equipment name is required',
    'string.min': 'Equipment name must be at least 3 characters',
  }),
  category: Joi.string()
    .valid(
      'Construction',
      'Agriculture',
      'Event',
      'Cleaning',
      'Power Tools',
      'Transportation',
      'Other'
    )
    .required()
    .messages({
      'any.required': 'Category is required',
      'any.only': 'Please select a valid category',
    }),
  description: Joi.string().min(10).max(2000).required().trim().messages({
    'any.required': 'Description is required',
    'string.min': 'Description must be at least 10 characters',
  }),
  pricePerDay: Joi.number().positive().required().messages({
    'any.required': 'Price per day is required',
    'number.positive': 'Price must be a positive number',
  }),
  securityDeposit: Joi.number().min(0).default(0),
  location: Joi.string().min(2).max(100).required().trim().messages({
    'any.required': 'Location is required',
  }),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  image: Joi.string().allow('', null).trim(),
  availability: Joi.boolean().default(true),
});

// update equipment validation schema
export const updateEquipmentValidation = Joi.object({
  name: Joi.string().min(3).max(120).trim(),
  category: Joi.string().valid(
    'Construction',
    'Agriculture',
    'Event',
    'Cleaning',
    'Power Tools',
    'Transportation',
    'Other'
  ),
  description: Joi.string().min(10).max(2000).trim(),
  pricePerDay: Joi.number().positive(),
  securityDeposit: Joi.number().min(0),
  location: Joi.string().min(2).max(100).trim(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  image: Joi.string().allow('', null).trim(),
  availability: Joi.boolean(),
}).min(1).messages({
  'object.min': 'Please provide at least one field to update',
});

export default {
  createEquipmentValidation,
  updateEquipmentValidation,
};
