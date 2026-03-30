const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Sequelize validation errors (fallback if still used)
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      errors: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Express-validator errors
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      errors: err.array()
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    code: err.code || 'SERVER_ERROR'
  });
};

module.exports = errorHandler;
