import * as equipmentService from '../services/equipment.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

// get all equipment listings
export const getEquipments = asyncHandler(async (req, res) => {
  const result = await equipmentService.getEquipments(req.query);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// get equipment details by id
export const getEquipmentById = asyncHandler(async (req, res) => {
  const result = await equipmentService.getEquipmentById(req.params.id);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// get current owner's equipment listings
export const getMyEquipments = asyncHandler(async (req, res) => {
  const ownerId = req.user.userId || req.user._id;
  const result = await equipmentService.getMyEquipments(ownerId);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// create a new equipment listing
export const createEquipment = asyncHandler(async (req, res) => {
  const ownerId = req.user.userId || req.user._id;
  const result = await equipmentService.createEquipment(ownerId, req.body);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 201,
  });
});

// update an equipment listing
export const updateEquipment = asyncHandler(async (req, res) => {
  const ownerId = req.user.userId || req.user._id;
  const result = await equipmentService.updateEquipment(req.params.id, ownerId, req.body);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// delete an equipment listing
export const deleteEquipment = asyncHandler(async (req, res) => {
  const ownerId = req.user.userId || req.user._id;
  const result = await equipmentService.deleteEquipment(req.params.id, ownerId);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

export default {
  getEquipments,
  getEquipmentById,
  getMyEquipments,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
