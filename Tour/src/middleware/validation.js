import { validationResult } from 'express-validator';
import ApiResponse from '../utils/apiResponse.js';

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));

    return res.status(400).json(
      ApiResponse.badRequest('Validation failed', formattedErrors)
    );
  };
};

// Custom validators
const customValidators = {
  isObjectId: (value) => {
    return /^[0-9a-fA-F]{24}$/.test(value);
  },

  isSlug: (value) => {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  },

  isMarkdown: (value) => {
    // Basic markdown validation
    if (typeof value !== 'string') return false;
    if (value.length > 100000) return false; // Max 100KB
    return true;
  }
};

export default {
  validate,
  customValidators
};