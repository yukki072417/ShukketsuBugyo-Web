const csrf = require('csurf');

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

// 開発環境ではCSRF保護を無効化
const conditionalCsrfProtection = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  return csrfProtection(req, res, next);
};

module.exports = conditionalCsrfProtection;