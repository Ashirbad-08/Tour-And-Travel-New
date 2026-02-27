import constants from '../config/constants.js';
const { STATUS_CODES } = constants;

class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  static success(data, message = 'Success') {
    return new ApiResponse(STATUS_CODES.OK, data, message);
  }

  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(STATUS_CODES.CREATED, data, message);
  }

  static error(statusCode, message = 'Error', errors = []) {
    const response = new ApiResponse(statusCode, null, message);
    response.errors = errors;
    return response;
  }

  static badRequest(message = 'Bad Request', errors = []) {
    return this.error(STATUS_CODES.BAD_REQUEST, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return this.error(STATUS_CODES.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Forbidden') {
    return this.error(STATUS_CODES.FORBIDDEN, message);
  }

  static notFound(message = 'Resource not found') {
    return this.error(STATUS_CODES.NOT_FOUND, message);
  }

  static conflict(message = 'Resource already exists') {
    return this.error(STATUS_CODES.CONFLICT, message);
  }

  static serverError(message = 'Internal Server Error') {
    return this.error(STATUS_CODES.SERVER_ERROR, message);
  }
}

export default ApiResponse;
