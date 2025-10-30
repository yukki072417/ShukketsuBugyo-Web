const db = require("./db")();
const { errorHandle } = require("../services/errorHandle");

async function createStudents(tenantID, students) {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  if (!Array.isArray(students)) errorHandle("BAD_REQUEST", 400);

  try {
    for (const student of students) {
      const {
        student_id,
        password,
        grade,
        class: className,
        number,
        course_name: courseName,
        course_name_en: courseNameEn,
      } = student;

      let courseID = student.course_id ? student.course_id : null;

      if(!tenantID || !student_id || !password || !grade || !className || !number) errorHandle("BAD_REQUEST", 400);

      if(courseName != null || courseNameEn != null){
        
        const courseNameSQL = courseName ? `COURSE_NAME = ?` : `COURSE_NAME_EN = ?`;
        const courseParams = [tenantID, courseName || courseNameEn];
        const courseSQL = `SELECT COURSE_ID FROM COURSES WHERE TENANT_ID = ? AND ${courseNameSQL}`;
        const courseIDResult = await db.query(courseSQL, courseParams);
        if (courseIDResult[0].length === 0) errorHandle("COURSE_NOT_FOUND", 404);
        courseID = courseIDResult[0][0].COURSE_ID;
      }

      // const courseExistByID = await db.query(
      //   `SELECT * FROM COURSES WHERE TENANT_ID = ? AND COURSE_ID = ?`,
      //   [tenantID, courseID]
      // );

      // if(courseExistByID[0].length === 0) errorHandle("COURSE_NOT_FOUND", 404);

      const exist = await db.query(
        `SELECT * FROM STUDENTS WHERE TENANT_ID = ? AND STUDENT_ID = ? AND GRADE = ? AND CLASS = ? AND NUMBER = ?`,
        [tenantID, student_id, grade, className, number]
      );
      if (exist[0].length > 0) errorHandle("DUPLICATE", 409);

      const sql = `
        INSERT INTO STUDENTS (TENANT_ID, STUDENT_ID, PASSWORD, GRADE, CLASS, NUMBER, COURSE_ID)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        tenantID,
        student_id,
        password,
        grade,
        className,
        number,
        courseID || null,
      ];
      await connection.query(sql, params);
    }

    await connection.commit();
    return { success: true, status: 201 };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getStudents(tenantID, limit, offset) {
  if ((!tenantID, limit, offset)) errorHandle("BAD_REQUEST", 400);

  try {
    const query = `
      SELECT *
      FROM STUDENTS
      WHERE TENANT_ID = ?
      ORDER BY student_id
      LIMIT ? OFFSET ?
    `;
    const params = [tenantID, limit, offset];
    const students = await db.query(query, params);

    if (students.length === 0) errorHandle("NOT_FOUND", 404);

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM STUDENTS WHERE TENANT_ID = ?`,
      [tenantID]
    );

    return { success: true, data: students[0], total, status: 200 };
  } catch (error) {
    throw error;
  }
}
async function getStudent(tenantID, studentID) {
  if (!tenantID || !studentID) errorHandle("BAD_REQUEST", 400);
  try {
    const query = `
      SELECT *
      FROM STUDENTS
      WHERE TENANT_ID = ? AND STUDENT_ID = ?
    `;
    const params = [tenantID, studentID];
    const student = await db.query(query, params);

    if (student.length === 0) errorHandle("NOT_FOUND", 404);
    else return { success: true, data: student[0], status: 200 };
  } catch (error) {}
}

async function getStudentsInClass(tenantID, grade, className) {
  if (!tenantID || !grade || !className) errorHandle("BAD_REQUEST", 400);
  try {
    const query = `
      SELECT *
      FROM STUDENTS
      WHERE TENANT_ID = ? AND GRADE = ? AND CLASS = ?
      ORDER BY student_id
    `;
    const params = [tenantID, grade, className];
    const students = await db.query(query, params);

    if (students.length === 0) errorHandle("NOT_FOUND", 404);
    else return { success: true, data: students[0], status: 200 };
  } catch (error) {
    throw error;
  }
}

async function patchStudent(
  studentID,
  password,
  grade,
  className,
  number,
  courseID
) {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    let updateFields = [];
    let params = [];
    
    if (password !== null) {
      updateFields.push('PASSWORD = ?');
      params.push(password);
    }
    if (grade !== undefined) {
      updateFields.push('GRADE = ?');
      params.push(grade);
    }
    if (className !== undefined) {
      updateFields.push('CLASS = ?');
      params.push(className);
    }
    if (number !== undefined) {
      updateFields.push('NUMBER = ?');
      params.push(number);
    }
    if (courseID !== undefined) {
      updateFields.push('COURSE_ID = ?');
      params.push(courseID);
    }
    
    if (updateFields.length === 0) {
      errorHandle('NO_FIELDS_TO_UPDATE', 400);
    }
    
    const sql = `UPDATE STUDENTS SET ${updateFields.join(', ')} WHERE STUDENT_ID = ?`;
    params.push(studentID);

    const result = await connection.query(sql, params);

    if (result[0].affectedRows === 0) errorHandle("NOT_FOUND", 404);
    await connection.commit();
    return { success: true, status: 200 };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteStudent(tenantID, studentID) {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const sql = `
      DELETE FROM STUDENTS
      WHERE TENANT_ID = ? AND STUDENT_ID = ?
    `;
    const params = [tenantID, studentID];
    const result = await connection.query(sql, params);

    if (result[0].affectedRows === 0) errorHandle("NOT_FOUND", 404);
    await connection.commit();
    return { success: true, status: 200 };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
module.exports = {
  createStudents,
  getStudents,
  getStudent,
  getStudentsInClass,
  patchStudent,
  deleteStudent,
};
