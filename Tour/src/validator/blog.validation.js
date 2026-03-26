import { body } from 'express-validator';
import customValidators from '../middleware/validation.js';

const createPostValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be at most 255 characters'),
  body('content_markdown')
    .notEmpty()
    .withMessage('Content is required')
    .custom(customValidators.isMarkdown)
    .withMessage('Content must be valid markdown'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot exceed 300 characters'),
  body('featured_image')
    .optional()
    .isObject().withMessage('Featured image must be an object')
    .custom((value) => {
      if (value && (!value.url || !value.public_id)) {
        throw new Error('Featured image must contain url and public_id');
      }
      return true;
    }),
  body('categories')
    .optional()
    .isArray().withMessage('Categories must be an array')
    .custom((value) => {
      if (value && !value.every(id => customValidators.isObjectId(id))) {
        throw new Error('Invalid category ID format');
      }
      return true;
    }),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((value) => {
      if (value && !value.every(tag => typeof tag === 'string' && tag.length <= 50)) {
        throw new Error('Tags must be strings and less than 50 characters');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(Object.values(POST_STATUS)).withMessage('Invalid post status'),

  body('published_at')
    .optional()
    .isISO8601().withMessage('Invalid date format')
    .toDate(),

  body('meta_title')
    .optional()
    .trim()
    .isLength({ max: 70 }).withMessage('Meta title cannot exceed 70 characters'),

  body('meta_description')
    .optional()
    .trim()
    .isLength({ max: 160 }).withMessage('Meta description cannot exceed 160 characters')
]

const updatePostValidation = [
  param('id')
    .custom(customValidators.isObjectId).withMessage('Invalid post ID'),

  ...createPostValidation.map(validation => validation.optional())
];

const getPostsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('category')
    .optional()
    .trim(),

  query('tag')
    .optional()
    .trim(),

  query('status')
    .optional()
    .isIn(Object.values(POST_STATUS)).withMessage('Invalid status'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query too long'),

  query('sort')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'published_at', 'title', 'view_count'])
    .withMessage('Invalid sort field'),

  query('order')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];

export default {
  createPostValidation,
  updatePostValidation,
  getPostsValidation
}