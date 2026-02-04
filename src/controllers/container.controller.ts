import { Response, NextFunction } from 'express';
import Container from '../models/Container.model';
import { sendSuccess, sendError, calculatePagination } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Get all containers
// @route   GET /api/containers
// @access  Private
export const getContainers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const siteId = req.query.siteId as string;
    const status = req.query.status as string;

    const { containers, total } = await Container.findAll({
      siteId,
      status,
      page,
      limit
    });

    const pagination = calculatePagination(page, limit, total);

    sendSuccess(res, 200, containers, pagination);
  } catch (error) {
    next(error);
  }
};

// @desc    Get container by ID
// @route   GET /api/containers/:id
// @access  Private
export const getContainerById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const container = await Container.findByIdWithRelations(req.params.id);

    if (!container) {
      sendError(res, 404, 'Container not found');
      return;
    }

    sendSuccess(res, 200, container);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new container
// @route   POST /api/containers
// @access  Private (Admin only)
export const createContainer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, type, siteId, location, capacity, status } = req.body;

    const container = await Container.create({
      name,
      type,
      siteId,
      location,
      capacity,
      status
    });

    // Get populated container with site info
    const populatedContainer = await Container.findByIdWithSite(container.id);

    sendSuccess(res, 201, populatedContainer);
  } catch (error) {
    next(error);
  }
};

// @desc    Update container
// @route   PUT /api/containers/:id
// @access  Private (Admin only)
export const updateContainer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, type, siteId, location, capacity, status } = req.body;

    const container = await Container.update(req.params.id, {
      name,
      type,
      siteId,
      location,
      capacity,
      status
    });

    if (!container) {
      sendError(res, 404, 'Container not found');
      return;
    }

    // Get populated container with site info
    const populatedContainer = await Container.findByIdWithSite(container.id);

    sendSuccess(res, 200, populatedContainer);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete container
// @route   DELETE /api/containers/:id
// @access  Private (Admin only)
export const deleteContainer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await Container.delete(req.params.id);

    if (!deleted) {
      sendError(res, 404, 'Container not found');
      return;
    }

  }
};


};
