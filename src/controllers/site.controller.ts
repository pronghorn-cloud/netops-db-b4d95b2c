import { Response, NextFunction } from 'express';
import Site from '../models/Site.model';
import { sendSuccess, sendError, calculatePagination } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Get all sites
// @route   GET /api/sites
// @access  Private
export const getSites = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const { sites, total } = await Site.findAll({
      search,
      status,
      page,
      limit
    });

    const pagination = calculatePagination(page, limit, total);

    sendSuccess(res, 200, sites, pagination);
  } catch (error) {
    next(error);
  }
};

// @desc    Get site by ID
// @route   GET /api/sites/:id
// @access  Private
export const getSiteById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const site = await Site.findByIdWithContainers(req.params.id);

    if (!site) {
      sendError(res, 404, 'Site not found');
      return;
    }

    sendSuccess(res, 200, site);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new site
// @route   POST /api/sites
// @access  Private (Admin only)
export const createSite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, location, address, description, status } = req.body;

    const site = await Site.create({
      name,
      location,
      address,
      description,
      status
    });

    sendSuccess(res, 201, site);
  } catch (error) {
    next(error);
  }
};

// @desc    Update site
// @route   PUT /api/sites/:id
// @access  Private (Admin only)
export const updateSite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, location, address, description, status } = req.body;

    const site = await Site.update(req.params.id, {
      name,
      location,
      address,
      description,
      status
    });

    if (!site) {
      sendError(res, 404, 'Site not found');
      return;
    }

    sendSuccess(res, 200, site);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete site
// @route   DELETE /api/sites/:id
// @access  Private (Admin only)
export const deleteSite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await Site.delete(req.params.id);

    if (!deleted) {
      sendError(res, 404, 'Site not found');
      return;
    }

    sendSuccess(res, 200, { message: 'Site deleted successfully' });
  } catch (error) {
    next(error);
  }
};


    sendSuccess(res, 200, site);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete site
// @route   DELETE /api/sites/:id
// @access  Private (Admin only)
export const deleteSite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const site = await Site.findByIdAndDelete(req.params.id);

    if (!site) {
      sendError(res, 404, 'Site not found');
      return;
    }

    sendSuccess(res, 200, { message: 'Site deleted successfully' });
  } catch (error) {
    next(error);
  }
};
