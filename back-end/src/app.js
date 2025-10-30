const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { createRateLimiter, inputValidation } = require('./middleware/security');
const { requestLogger } = require('./middleware/logging');

const teacherRouter = require("./routes/teacher.routes");
const tenantRouter = require("./routes/tenant.routes");
const timeslotRouter = require("./routes/timeslot.routes");
const authRouter = require("./routes/auth.routes");
const studentRouter = require("./routes/student.routes");
const enrollmentRouter = require("./routes/enrollment.routes");
const lessonRouter = require("./routes/lesson.routes");
const courseRouter = require("./routes/course.routes");
const classRouter = require("./routes/class.routes");
const timetableRouter = require("./routes/timetable.routes");
const attendanceRouter = require("./routes/attendance.routes");

const teacherController = require("./controllers/teacher.controller");
const studentController = require("./controllers/student.controller");
const authorize = require("./services/authorize");

const app = express();
require('dotenv').config();

// セキュリティミドルウェア
app.use(helmet());

// レートリミット設定
const loginLimiter = createRateLimiter(
  15 * 60 * 1000, // 15分
  15, // 15分間に15回まで
  { result: 'ERROR', message: 'Too many login attempts from this IP' }
);

const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15分
  1000, // 15分間に1000回まで
  { result: 'ERROR', message: 'Too many login attempts from this IP' }
);

const corsOptions = {
  // origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'https://localhost:3000'],
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// MIMEスニッフィング防止（helmetで自動設定されるが明示も可）
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

// CSP（helmetのcspオプションでも設定可能）
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self';");
  next();
});

// X-Frame-Options
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

// HSTS（HTTPS通信を強制）
app.use((req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});



// Expressのバージョン情報を隠す
app.disable("x-powered-by");
app.use(cors(corsOptions));
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(inputValidation);

// API全体に基本的なレートリミットを適用
app.use("/api/", apiLimiter);

// 公開ルート（認証不要）
// ログインにはより厳しいレートリミットを適用
app.post("/api/teacher/login", loginLimiter, teacherController.login);
app.post("/api/student/login", loginLimiter, studentController.login);

// 認証関連のルート
app.use("/api/auth", authRouter);

// 保護ルート（認証が必要）
app.post("/api/teacher/signup", authorize.authorize, authorize.isManager, teacherController.signup);
app.use("/api/period", authorize.authorize, authorize.isTeacher, timeslotRouter);
app.use("/api/teacher", authorize.authorize, authorize.isTeacher, teacherRouter);
app.use("/api/enrollment", authorize.authorize, authorize.isTeacher, enrollmentRouter);
app.use("/api/lesson", authorize.authorize, authorize.isTeacher, lessonRouter);
app.use("/api/course", authorize.authorize, authorize.isTeacher, courseRouter);
app.use("/api/class", authorize.authorize, authorize.isTeacher, classRouter);
app.use("/api/timetable", authorize.authorize, authorize.isTeacher, timetableRouter);
app.use("/api/student", authorize.authorize, studentRouter);
app.use("/api/attendance", authorize.authorize, attendanceRouter);

// 運営専用ルート（サービスAPIキー認証）
app.use("/api/admin/tenant", authorize.verifyServiceAPIKey, tenantRouter);
app.post("/api/admin/teacher/signup", authorize.verifyServiceAPIKey, teacherController.signup);

let options = {};
if (process.env.NODE_ENV !== 'development') {
  const keyPath = process.env.TLS_KEY_PATH || "./certs/server.key";
  const crtPath = process.env.TLS_CERT_PATH || "./certs/server.crt";

  if (!fs.existsSync(keyPath) || !fs.existsSync(crtPath)) {
    throw new Error(`TLS certificate files not found. Key: ${keyPath}, Cert: ${crtPath}`);
  }

  options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(crtPath),
  };
}

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// 404ハンドラー
app.use(notFoundHandler);

// エラーハンドラー
app.use(errorHandler);

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

// HTTPサーバーも起動（開発用）
if (process.env.NODE_ENV === 'development') {
  app.listen(port, host, () => {
    console.log(`HTTP API server running on http://${host}:${port}`);
  });
} else {
  https.createServer(options, app).listen(port, host, () => {
    console.log(`HTTPS API server running on https://${host}:${port}`);
  });
}

module.exports = app;