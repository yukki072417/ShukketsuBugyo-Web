const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      result: 'ERROR',
      message: 'Validation failed'
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      result: 'ERROR',
      message: 'Unauthorized'
    });
  }

  res.status(err.status || 500).json({
    result: 'ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    result: 'ERROR',
    message: 'Endpoint not found'
  });
};

module.exports = { errorHandler, notFoundHandler };