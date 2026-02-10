const { ErrorResponse } = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
    console.error('Error Details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      keyValue: err.keyValue,
      errors: err.errors
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    error = ErrorResponse.badRequest(
      `Invalid ${err.path}: ${err.value}`,
      { path: err.path, value: err.value }
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = ErrorResponse.conflict(
      `Duplicate value for ${field}: ${value}`,
      { field, value }
    );
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = {};
    Object.keys(err.errors).forEach(key => {
      errors[key] = err.errors[key].message;
    });
    error = ErrorResponse.validationError(errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ErrorResponse.jwtError('invalid');
  }

  if (err.name === 'TokenExpiredError') {
    error = ErrorResponse.jwtError('expired');
  }

  // Cloudinary errors
  if (err.http_code && err.http_code >= 400) {
    error = ErrorResponse.fileUploadError(
      err.message || 'File upload failed',
      { code: err.http_code, name: err.name }
    );
  }

  // Razorpay errors
  if (err.error && err.error.description) {
    error = ErrorResponse.paymentError(
      err.error.description,
      { code: err.error.code, reason: err.error.reason }
    );
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = ErrorResponse.fileUploadError(
      'File size is too large',
      { maxSize: `${err.limit / (1024 * 1024)}MB` }
    );
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = ErrorResponse.fileUploadError(
      'Unexpected file field',
      { field: err.field }
    );
  }

  // Rate limit error
  if (err.name === 'RateLimitError') {
    error = ErrorResponse.rateLimitError(
      err.message,
      { retryAfter: err.retryAfter }
    );
  }

  // If it's already an ErrorResponse instance, use it
  if (err instanceof ErrorResponse) {
    error = err;
  }

  // Default to 500 server error
  if (!error.statusCode || error.statusCode === 500) {
    error = ErrorResponse.internalServerError(
      process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
      process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
    );
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Server Error',
      statusCode: error.statusCode || 500,
      status: `${error.statusCode}`.startsWith('4') ? 'fail' : 'error',
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        originalError: {
          name: err.name,
          message: err.message,
          code: err.code
        }
      })
    }
  });
};

module.exports = errorHandler;