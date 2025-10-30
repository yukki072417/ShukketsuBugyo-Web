const { formatResponse } = require('../services/format');
const detectValueDuplicate = require('../services/duplicate.detector');
const studentModel = require('../models/student.model');
const authorize = require('../services/authorize');
const bcrypt = require('bcryptjs');
const { errorHandle } = require('../services/errorHandle');
const { validateTenantID, validateStudentID, validatePassword, validateGrade } = require('../middleware/validation');
const { sanitizeObject } = require('../utils/sanitizer');

async function createStudent(req, res){
    const tenantID = req.tenant_id;
    const bodys = sanitizeObject(req.body);

    try {
        validateTenantID(tenantID);
        
        if(!Array.isArray(bodys)) errorHandle('BAD_REQUEST', 400);
        
        if(detectValueDuplicate(bodys, ['password', 'grade', 'class', 'number, course_name, course_name_en']) === true){
          errorHandle('REQUEST_BODY_DUPLICATE', 409);
        }
        for(const body of bodys){
          const { student_id, password, grade, class: className, number, course_id: courseID, course_name: courseName, course_name_en: courseNameEn } = body;
          
          validateStudentID(student_id);
          validatePassword(password);
          validateGrade(grade);
          
          if(!className || !number) errorHandle('BAD_REQUEST', 400);
          
          // パスワードハッシュ化を追加
          body.password = await bcrypt.hash(password, 10);
          
          if(!courseID) body.course_id = null;
          if(!courseName) body.course_name = null;
          if(!courseNameEn) body.course_name_en = null;
        }
        
        
        const result = await studentModel.createStudents(tenantID, bodys);
        if(result.success === true) return res.status(result.status).json({result: 'SUCCESS'});
        else errorHandle(result.message, result.status || 500);

    } catch (error) {
        return res.status(error.status || 500).json({result: 'ERROR', message: error.message});
    }
}

async function login(req, res) {
    const { tenant_id: tenantID, student_id: studentID, student_password: password } = req.body;

    try {
        const result = await studentModel.getStudent(tenantID, studentID);
        
        if(result.data.length === 0) errorHandle('NOT_FOUND', 404);
        const passwordMatched = bcrypt.compareSync(password, result.data[0].PASSWORD);
        
        if(tenantID !== result.data[0].TENANT_ID || !passwordMatched) errorHandle('WRONG_SOMETHING', 401);

        return res.status(200).json({ result: 'SUCCESS', token: authorize.createJWTs(tenantID, studentID, 'student', false) });
    }catch(error){
        return res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
    }
}

async function getStudents(req, res) {
  const tenantID = req.tenant_id;
  const limit = parseInt(req.query.limit, 10) || 100;
  const offset = parseInt(req.query.offset, 10) || 0;

  try {
    validateTenantID(tenantID);
    
    if(limit < 1 || limit > 1000) errorHandle('Invalid limit', 400);
    if(offset < 0) errorHandle('Invalid offset', 400);

    const result = await studentModel.getStudents(tenantID, limit, offset);

    if (!result || !result.data) {
      return errorHandle('SERVER_ERROR', 500);
    }
    
    const response = formatResponse(result.data);
    
    if (!response || !response.success) {
      return errorHandle('SERVER_ERROR', 500);
    }
    
    const total = result.total;
    res.status(result.status).json({
      result: 'SUCCESS',
      response,
      total,
      limit,
      offset
    });

    } catch (err) {
    console.error('Error fetching students:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getStudent(req, res) {
  const tenantID = req.tenant_id;
  const studentID = req.params.student_id;

  try {
    validateTenantID(tenantID);
    validateStudentID(studentID);

    const result = await studentModel.getStudent(tenantID, studentID);
    if(result.success === false) errorHandle(result.message, result.status || 500);

    const response = formatResponse(result.data).success === true ? formatResponse(result.data): null;
    response.data.map((item) => delete item.tenant_id);

    if(response === null) errorHandle('SERVER_ERROR', 500);

    return res.status(200).json({result: 'SUCCESS', data: response.data[0]});

  }catch(error){
    return res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
  }
  
}

async function getStudentsInClass(req, res) {
  const tenantID = req.tenant_id;
  const grade = req.query.grade;
  const className = req.query.class;
  
  try {
    validateTenantID(tenantID);
    if(!className) errorHandle('BAD_REQUEST', 400);
    if(grade) validateGrade(parseInt(grade));

    const result = await studentModel.getStudentsInClass(tenantID, grade, className);
    if(result.success === false) errorHandle(result.message, result.status || 500)

    if (!result || !result.success || !result.data) {
      return errorHandle('SERVER_ERROR', 500);
    }
    const response = formatResponse(result.data);
    
    if (!response || !response.success || !response.data) {
      return errorHandle('SERVER_ERROR', 500);
    }

    response.data.forEach((item) => {
      delete item.tenant_id
      delete item.password
    });

    return res.status(200).json({result: 'SUCCESS', data: response.data});

  }catch(error){
    return res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
  }
}

async function patchStudent(req, res) {
  const tenantID = req.tenant_id;
  const studentID = req.params.student_id;
  
  const { password, grade, class: className, number, course_id: courseID = null } = req.body;

  try {
    validateTenantID(tenantID);
    validateStudentID(studentID);
    if(grade) validateGrade(grade);
    if(password && password !== null) validatePassword(password);
    
    // パスワードがnullでない場合のみハッシュ化
    const hashedPassword = (password && password !== null) ? await bcrypt.hash(password, 10) : null;
    
    const result = await studentModel.patchStudent(
      studentID, 
      hashedPassword,
      grade, 
      className, 
      number, 
      courseID
    );

    if(result.success === false) {
      errorHandle(result.message, result.status || 500);
    }
    
    res.status(result.status).json({ result: 'SUCCESS' });
    
  } catch (error) {
    res.status(error.status || 500).json({ 
      result: 'ERROR', 
      message: error.message 
    });    
  }
}

async function deleteStudent(req, res) {
  const tenantID = req.tenant_id;
  const studentID = req.params.student_id;

  try {
    validateTenantID(tenantID);
    validateStudentID(studentID);

    const result = await studentModel.deleteStudent(tenantID, studentID);

    if(result.success === false) errorHandle(result.message, result.status || 500);
    else res.status(result.status).json({result: 'SUCCESS'});

  } catch (error) {
    res.status(error.status || 500).json({ result: 'ERROR', message: error.message });
  }
}

module.exports = {
    createStudent,
    login,
    getStudents,
    getStudent,
    getStudentsInClass,
    patchStudent,
    deleteStudent
}