const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: message || { result: 'ERROR', message: 'Too many requests' },
    skip: (req) => {
      const trustedIPs = (process.env.TRUSTED_IPS || '').split(',').filter(ip => ip.trim());
      return trustedIPs.includes(req.ip);
    }
  });
};

const inputValidation = (req, res, next) => {
  const body = JSON.stringify(req.body);
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /expression\s*\(/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(body))) {
    return res.status(400).json({ result: 'ERROR', message: 'Invalid input detected' });
  }
  next();
};

module.exports = { createRateLimiter, inputValidation };