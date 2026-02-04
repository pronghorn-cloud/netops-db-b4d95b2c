import { Response, NextFunction } from 'express';
import Device from '../models/Device.model';
import { sendSuccess, sendError, calculatePagination } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Get all devices
// @route   GET /api/devices
// @access  Private
export const getDevices = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const containerId = req.query.containerId as string;
    const type = req.query.type as string;
    const status = req.query.status as string;

    const { devices, total } = await Device.findAll({
      containerId,
      type,
      status,
      page,
      limit
    });

    const pagination = calculatePagination(page, limit, total);

    sendSuccess(res, 200, devices, pagination);
  } catch (error) {
    next(error);
  }
};

// @desc    Get device by ID
// @route   GET /api/devices/:id
// @access  Private
export const getDeviceById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const device = await Device.findByIdWithRelations(req.params.id);

    if (!device) {
      sendError(res, 404, 'Device not found');
      return;
    }

    sendSuccess(res, 200, device);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new device
// @route   POST /api/devices
// @access  Private (Admin only)
export const createDevice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      type,
      manufacturer,
      model,
      serialNumber,
      ipAddress,
      macAddress,
      containerId,
      status,
      notes
    } = req.body;

    const device = await Device.create({
      name,
      type,
      manufacturer,
      model,
      serialNumber,
      ipAddress,
      macAddress,
      containerId,
      status,
      notes
    });

    // Get populated device with container info
    const populatedDevice = await Device.findByIdWithContainer(device.id);

    sendSuccess(res, 201, populatedDevice);
  } catch (error) {
    next(error);
  }
};

// @desc    Update device
// @route   PUT /api/devices/:id
// @access  Private (Admin only)
export const updateDevice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      type,
      manufacturer,
      model,
      serialNumber,
      ipAddress,
      macAddress,
      containerId,
      status,
      notes
    } = req.body;

    const device = await Device.update(req.params.id, {
      name,
      type,
      manufacturer,
      model,
      serialNumber,
      ipAddress,
      macAddress,
      containerId,
      status,
      notes
    });

    if (!device) {
      sendError(res, 404, 'Device not found');
      return;
    }

    // Get populated device with container info
    const populatedDevice = await Device.findByIdWithContainer(device.id);

    sendSuccess(res, 200, populatedDevice);
  } catch (error) {
    next(error);
  }
};
// @desc    Delete device
// @route   DELETE /api/devices/:id
// @access  Private (Admin only)
export const deleteDevice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await Device.delete(req.params.id);

    if (!deleted) {
      sendError(res, 404, 'Device not found');
      return;
    }

    sendSuccess(res, 200, { message: 'Device deleted successfully' });
  } catch (error) {
    next(error);
  }
};
