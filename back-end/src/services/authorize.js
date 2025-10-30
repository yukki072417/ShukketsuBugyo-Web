const jwt = require('jsonwebtoken');

// 環境変数の検証
const requiredEnvVars = [
  'JWT_TEACHERS_SECRET',
  'JWT_STUNDENTS_SECRET',
  'REFRESH_TEACHERS_SECRET',
  'REFRESH_STUNDENTS_SECRET'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

const createJWTs = (tenant_id, user_id, roll, manager) => {
  const issuer = process.env.JWT_ISSUER || 'shukketsu-bugyo';
  let accessSecretKey, refreshSecretKey;

  if (roll === 'student') {
    accessSecretKey = process.env.JWT_STUNDENTS_SECRET;
    refreshSecretKey = process.env.REFRESH_STUNDENTS_SECRET;
  } else if (roll === 'teacher') {
    accessSecretKey = process.env.JWT_TEACHERS_SECRET;
    refreshSecretKey = process.env.REFRESH_TEACHERS_SECRET;
  } else {
    return { error: 'BAD_REQUEST' };
  }
  
  const access_token = jwt.sign(
    { data: { user_id, tenant_id, role: roll, manager: manager } },
    accessSecretKey,
    {
      expiresIn: '1h',
      algorithm: 'HS256',
      issuer: issuer
    }
  );

  const refresh_token = jwt.sign(
    { data: { user_id, tenant_id, role: roll } },
    refreshSecretKey,
    {
      expiresIn: '7d',
      algorithm: 'HS256',
      issuer: issuer
    }
  );

  return { access_token, refresh_token };
};

const authorize = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const apiKey = req.headers['x-api-key'];
  
  const validApiKeys = (process.env.API_KEYS || '').split(',');
  const validServiceApiKeys = (process.env.SERVICES_API_KEY || '').split(',');
  if (apiKey && (validApiKeys.includes(apiKey) || validServiceApiKeys.includes(apiKey))) {
    // APIキーが有効な場合、テナントIDなどをreqオブジェクトに設定する必要があるかもしれない
    // 現状では単にnext()を呼び出す
    return next();
  }

  if (!token) {
    return res.status(401).json({ result: 'ERROR', message: 'UNAUTHORIZED' });
  }

  const issuer = process.env.JWT_ISSUER || 'shukketsu-bugyo';

  jwt.verify(token, process.env.JWT_TEACHERS_SECRET, { issuer }, (err, decoded) => {
    if (!err && decoded?.data?.user_id && decoded?.data?.tenant_id) {
      req.user = decoded.data; // ペイロード全体を格納
      req.tenant_id = decoded.data.tenant_id;
      req.user_id = decoded.data.user_id;
      return next();
    }
    
    // 教員トークンで失敗した場合、生徒トークンとして検証
    jwt.verify(token, process.env.JWT_STUNDENTS_SECRET, { issuer }, (err, decoded) => {
      if (err) {
        return res.status(401).json({ result: 'ERROR', message: 'EXPIRED_OR_INVALID_TOKEN' });
      }
      
      if (!decoded.data || !decoded.data.user_id || !decoded.data.tenant_id) {
        return res.status(401).json({ result: 'ERROR', message: 'INVALID_TOKEN_PAYLOAD' });
      }
      
      req.user = decoded.data; // ペイロード全体を格納
      req.tenant_id = decoded.data.tenant_id;
      req.user_id = decoded.data.user_id;
      next();
    });
  });
};

const isTeacher = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    next();
  } else {
    res.status(403).json({ result: 'ERROR', message: 'FORBIDDEN' });
  }
};

const isManager = (req, res, next) => {
  if (req.user && req.user.manager) {
    next();
  } else {
    res.status(403).json({ result: 'ERROR', message: 'FORBIDDEN' });
  }
};

const refreshAccessToken = (req, res) => {
  const refreshToken = req.body.refresh_token;

  if (!refreshToken || refreshToken === '') return res.status(400).json({ message: 'BAD_REQUEST' });

  const issuer = process.env.JWT_ISSUER || 'shukketsu-bugyo';
  let decoded, accessSecretKey;

  try {
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TEACHERS_SECRET, { issuer });
      accessSecretKey = process.env.JWT_TEACHERS_SECRET;
    } catch {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_STUNDENTS_SECRET, { issuer });
      accessSecretKey = process.env.JWT_STUNDENTS_SECRET;
    }
    
    if (!decoded.data || !decoded.data.user_id || !decoded.data.tenant_id) {
      return res.status(403).json({ message: 'INVALID_REFRESH_TOKEN' });
    }
    
    const newAccessToken = jwt.sign(
      { data: decoded.data },
      accessSecretKey,
      { expiresIn: '1h', algorithm: 'HS256', issuer }
    );

    return res.status(200).json({
      message: 'TOKEN_REFRESHED',
      access_token: newAccessToken
    });
  } catch (err) {
    return res.status(403).json({ message: 'INVALID_REFRESH_TOKEN' });
  }
};
const decodeUserPayloadFromToken = (token) => {
  const issuer = process.env.JWT_ISSUER || 'shukketsu-bugyo';
  try {
    try {
      const decoded = jwt.verify(token, process.env.JWT_TEACHERS_SECRET, { issuer });
      if (decoded.data?.user_id && decoded.data?.tenant_id) {
        return { id: decoded.data.user_id, tenant_id: decoded.data.tenant_id };
      }
    } catch {}
    
    const decoded = jwt.verify(token, process.env.JWT_STUNDENTS_SECRET, { issuer });
    if (decoded.data?.user_id && decoded.data?.tenant_id) {
      return { id: decoded.data.user_id, tenant_id: decoded.data.tenant_id };
    }
    return { id: null, tenant_id: null };
  } catch (err) {
    console.error('JWT decode error:', err.message);
    return { id: null, tenant_id: null };
  }
};

const verifyTokenOnly = (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ result: 'ERROR', message: 'UNAUTHORIZED' });
  }

  const issuer = process.env.JWT_ISSUER || 'shukketsu-bugyo';

  jwt.verify(token, process.env.JWT_TEACHERS_SECRET, { issuer }, (err, decoded) => {
    if (!err && decoded?.data?.user_id && decoded?.data?.tenant_id) {
      return res.status(200).json({ result: 'SUCCESS', user: decoded.data });
    }
    
    jwt.verify(token, process.env.JWT_STUNDENTS_SECRET, { issuer }, (err, decoded) => {
      if (err) {
        return res.status(401).json({ result: 'ERROR', message: 'EXPIRED_OR_INVALID' });
      }
      
      if (!decoded.data || !decoded.data.user_id || !decoded.data.tenant_id) {
        return res.status(401).json({ result: 'ERROR', message: 'INVALID_TOKEN_PAYLOAD' });
      }
      
      return res.status(200).json({ result: 'SUCCESS', user: decoded.data });
    });
  });
};

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ result: 'ERROR', message: 'UNAUTHORIZED' });
  }

  const issuer = process.env.JWT_ISSUER || 'shukketsu-bugyo';

  jwt.verify(token, process.env.JWT_TEACHERS_SECRET, { issuer }, (err, decoded) => {
    if (!err && decoded?.data?.user_id && decoded?.data?.tenant_id) {
      req.user = decoded.data;
      return next();
    }
    
    jwt.verify(token, process.env.JWT_STUNDENTS_SECRET, { issuer }, (err, decoded) => {
      if (err) {
        return res.status(401).json({ result: 'ERROR', message: 'EXPIRED_OR_INVALID_TOKEN' });
      }
      
      if (!decoded.data || !decoded.data.user_id || !decoded.data.tenant_id) {
        return res.status(401).json({ result: 'ERROR', message: 'INVALID_TOKEN_PAYLOAD' });
      }
      
      req.user = decoded.data;
      next();
    });
  });
};

const verifyServiceAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKeys = (process.env.SERVICES_API_KEY || '').split(',');

  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({ result: 'ERROR', message: 'UNAUTHORIZED' });
  }
  next();
};

module.exports = {
  createJWTs,
  authorize,
  isTeacher,
  isManager,
  refreshAccessToken,
  decodeUserPayloadFromToken,
  verifyTokenOnly,
  verifyJWT,
  verifyServiceAPIKey
}