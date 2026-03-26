export default {
  // User roles
  USER_ROLES: {
    ADMIN: 'admin',
    EDITOR: 'editor',
    USER: 'user'
  },

  // Blog post status
  POST_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
  },

  // Comment status
  COMMENT_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },

  // Validation messages
  VALIDATION_MESSAGES: {
    REQUIRED: '{#label} is required',
    INVALID_EMAIL: 'Please provide a valid email address',
    PASSWORD_MIN: 'Password must be at least 6 characters long',
    PASSWORD_PATTERN: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    INVALID_URL: 'Please provide a valid URL',
    IMAGE_SIZE: 'Image size must be less than 5MB',
    IMAGE_TYPE: 'Only JPG, JPEG, PNG, GIF, and WEBP files are allowed'
  },

  // API Status codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  }
};