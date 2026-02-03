import { Router } from 'express';
import { body } from 'express-validator';
import {
  getSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite
} from '../controllers/site.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { runValidation } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const siteValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Site name is required')
    .isLength({ max: 100 })
    .withMessage('Site name cannot exceed 100 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Address cannot exceed 300 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];

const updateSiteValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Site name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Site name cannot exceed 100 characters'),
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Address cannot exceed 300 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];

// Routes
router.get('/', protect, getSites);
router.get('/:id', protect, getSiteById);
router.post('/', protect, authorize('admin'), runValidation(siteValidation), createSite);
router.put('/:id', protect, authorize('admin'), runValidation(updateSiteValidation), updateSite);
router.delete('/:id', protect, authorize('admin'), deleteSite);

export default router;
