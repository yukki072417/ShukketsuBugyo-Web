const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim().replace(/[<>]/g, '');
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const removeNullUndefined = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.filter(item => item !== null && item !== undefined).map(removeNullUndefined);
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      cleaned[key] = typeof value === 'object' ? removeNullUndefined(value) : value;
    }
  }
  return cleaned;
};

module.exports = { sanitizeObject, removeNullUndefined };