import { Router } from 'express';
import { body } from 'express-validator';
import {
  getContainers,
  getContainerById,
  createContainer,
  updateContainer,
  deleteContainer
} from '../controllers/container.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { runValidation } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const containerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Container name is required')
    .isLength({ max: 100 })
    .withMessage('Container name cannot exceed 100 characters'),
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Container type is required')
    .isIn(['rack', 'cabinet', 'closet', 'room', 'other'])
    .withMessage('Type must be rack, cabinet, closet, room, or other'),
  body('siteId')
    .notEmpty()
    .withMessage('Site ID is required')
    .isMongoId()
    .withMessage('Invalid Site ID format'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Capacity must be a positive number'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];

const updateContainerValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Container name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Container name cannot exceed 100 characters'),
  body('type')
    .optional()
    .trim()
    .isIn(['rack', 'cabinet', 'closet', 'room', 'other'])
    .withMessage('Type must be rack, cabinet, closet, room, or other'),
  body('siteId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Site ID format'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Capacity must be a positive number'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];

// Routes
router.get('/', protect, getContainers);
router.get('/:id', protect, getContainerById);
router.post('/', protect, authorize('admin'), runValidation(containerValidation), createContainer);
router.put('/:id', protect, authorize('admin'), runValidation(updateContainerValidation), updateContainer);
router.delete('/:id', protect, authorize('admin'), deleteContainer);

export default router;
