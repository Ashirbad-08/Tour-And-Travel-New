

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;

  let message = err.message || "Internal Server Error";


  

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;

    const errors = {};

    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });

    return res.status(statusCode).json({
      success: false,
      message: "Validation Error",
      errors,
    });
  }

  // Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT Error
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  if (err.errors) {
    return res.status(statusCode).json({
      success: false,
      message: "Validation Error",
      errors:err.errors,
    });
  }
  
  // Default Error
  res.status(statusCode).json({
      success: false,
      message,
    });
};
