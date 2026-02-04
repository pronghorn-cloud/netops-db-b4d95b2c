import { Router } from 'express';
import { body } from 'express-validator';
import {
  getDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice
} from '../controllers/device.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { runValidation } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const deviceValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Device name is required')
    .isLength({ max: 100 })
    .withMessage('Device name cannot exceed 100 characters'),
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Device type is required')
    .isIn(['switch', 'router', 'firewall', 'server', 'access-point', 'other'])
    .withMessage('Type must be switch, router, firewall, server, access-point, or other'),
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Manufacturer name cannot exceed 100 characters'),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model name cannot exceed 100 characters'),
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Serial number cannot exceed 100 characters'),
  body('ipAddress')
    .optional()
    .trim()
    .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)
    .withMessage('Please provide a valid IP address'),
  body('macAddress')
    .optional()
    .trim()
    .matches(/^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i)
    .withMessage('Please provide a valid MAC address (format: XX:XX:XX:XX:XX:XX)'),
  body('containerId')
  body('containerId')
    .notEmpty()
    .withMessage('Container ID is required')
    .isUUID()
    .withMessage('Invalid Container ID format'),

    .withMessage('Invalid Container ID format'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance'])
    .withMessage('Status must be active, inactive, or maintenance'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

const updateDeviceValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Device name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Device name cannot exceed 100 characters'),
  body('type')
    .optional()
    .trim()
    .isIn(['switch', 'router', 'firewall', 'server', 'access-point', 'other'])
    .withMessage('Type must be switch, router, firewall, server, access-point, or other'),
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Manufacturer name cannot exceed 100 characters'),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model name cannot exceed 100 characters'),
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Serial number cannot exceed 100 characters'),
  body('ipAddress')
    .optional()
    .trim()
    .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)
    .withMessage('Please provide a valid IP address'),
  body('macAddress')
    .optional()
  body('containerId')
    .optional()
    .isUUID()
    .withMessage('Invalid Container ID format'),

  body('containerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Container ID format'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance'])
    .withMessage('Status must be active, inactive, or maintenance'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Routes
router.get('/', protect, getDevices);
router.get('/:id', protect, getDeviceById);
router.post('/', protect, authorize('admin'), runValidation(deviceValidation), createDevice);
router.put('/:id', protect, authorize('admin'), runValidation(updateDeviceValidation), updateDevice);
router.delete('/:id', protect, authorize('admin'), deleteDevice);

export default router;
