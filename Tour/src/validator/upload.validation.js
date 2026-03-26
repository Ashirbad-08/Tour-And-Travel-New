import { body, param } from 'express-validator';
import { VALIDATION_MESSAGES } from '../config/constants';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5242880;
const ALLOWED_TYPES = (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,gif,webp').split(',');

const uploadImageValidation = [
  body('alt')
    .optional()
    .trim()
    .isLength({ max: 125 }).withMessage('Alt text cannot exceed 125 characters'),

  body('folder')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Folder name too long')
];

const deleteImageValidation = [
  param('publicId')
    .notEmpty().withMessage('Public ID is required')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Invalid public ID format')
];
export default {
  uploadImageValidation,
  deleteImageValidation,
  MAX_FILE_SIZE,
  ALLOWED_TYPES
};