const { createValidationError } = require('../services/errorHandle');

const validateTenantID = (tenantID) => {
  if (!tenantID || typeof tenantID !== 'string' || tenantID.length < 1) {
    createValidationError('tenant_id', tenantID);
  }
};

const validateStudentID = (studentID) => {
  if (!studentID || typeof studentID !== 'string' || studentID.length < 1) {
    createValidationError('student_id', studentID);
  }
};

const validateTeacherID = (teacherID) => {
  if (!teacherID || typeof teacherID !== 'string' || teacherID.length < 1) {
    createValidationError('teacher_id', teacherID);
  }
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string' || password.length < 6) {
    createValidationError('password', 'Password must be at least 6 characters');
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    createValidationError('email', email);
  }
};

const validateGrade = (grade) => {
  if (grade !== undefined && (grade < 1 || grade > 12)) {
    createValidationError('grade', grade);
  }
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

module.exports = {
  validateTenantID,
  validateStudentID,
  validateTeacherID,
  validatePassword,
  validateEmail,
  validateGrade,
  sanitizeInput
};