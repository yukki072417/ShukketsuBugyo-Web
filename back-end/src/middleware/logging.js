const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // リクエストボディをログに記録（GET以外）
  let requestBody = null;
  if (req.method !== 'GET' && req.body) {
    requestBody = JSON.stringify(req.body);
  }
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestBody
    };
    
    if (process.env.NODE_ENV !== 'test') {
      console.log(`${logEntry.method} ${logEntry.url} ${logEntry.status} ${logEntry.duration}`);
    }
    
    if (process.env.ENABLE_FILE_LOGGING === 'true') {
      const logFile = path.join(logDir, `access-${new Date().toISOString().split('T')[0]}.log`);
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    }
  });
  
  next();
};

const securityLogger = (event, details) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details
  };
  
  console.warn('SECURITY EVENT:', logEntry);
  
  if (process.env.ENABLE_FILE_LOGGING === 'true') {
    const logFile = path.join(logDir, `security-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }
};

const operationLogger = (operation, userId, details) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    userId,
    details
  };
  
  console.log('OPERATION:', logEntry);
  
  if (process.env.ENABLE_FILE_LOGGING === 'true') {
    const logFile = path.join(logDir, `operations-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }
};

const dbLogger = (action, table, data, userId) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    table,
    data,
    userId
  };
  
  console.log('DATABASE:', logEntry);
  
  if (process.env.ENABLE_FILE_LOGGING === 'true') {
    const logFile = path.join(logDir, `database-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }
};

module.exports = { requestLogger, securityLogger, operationLogger, dbLogger };