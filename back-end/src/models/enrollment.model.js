const db = require("./db")();
const UUID = require("uuid");
const { errorHandle } = require("../services/errorHandle");

async function createEnrollments(tenantID, students) {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  if (!tenantID || !students) errorHandle("BAD_REQUEST", 400);
  else if (Array.isArray(students) === false) errorHandle("BAD_REQUEST", 400);

  try {
      for (const student of students) {
        const studentID = student.student_id;
        const lessonID = student.lesson_id;

        const exist = await db.query(
          "SELECT * FROM ENROLLMENTS WHERE TENANT_ID = ? AND STUDENT_ID = ? AND LESSON_ID = ?",
          [tenantID, studentID, lessonID]
        );

        if (exist[0].length > 0) errorHandle("DUPLICATE", 409);
        if (!studentID || !lessonID) errorHandle("BAD_REQUEST", 400);

        const enrollmentID = UUID.v4();
        const query =
          "INSERT INTO ENROLLMENTS (TENANT_ID, STUDENT_ID, LESSON_ID, ENROLLMENT_ID) VALUES (?, ?, ?, ?)";
        const values = [tenantID, studentID, lessonID, enrollmentID];
        const result = await db.query(query, values);

        if (result[0].affectedRows === 0)
          errorHandle("INTERNAL_SERVER_ERROR", 500);
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

async function getEnrollments(tenantID, filters = {}) {
  const connection = await db.getConnection();
  try {
    if (!tenantID) errorHandle("BAD_REQUEST", 400);

    let query = `
      SELECT
        e.ENROLLMENT_ID,
        e.LESSON_ID,
        e.STATUS,
        s.STUDENT_ID,
        s.GRADE,
        s.CLASS,
        s.NUMBER
      FROM ENROLLMENTS e
      JOIN STUDENTS s ON e.TENANT_ID = s.TENANT_ID AND e.STUDENT_ID = s.STUDENT_ID
      WHERE e.TENANT_ID = ?
    `;
    const values = [tenantID];

    if (filters.student_id) {
      query += " AND e.STUDENT_ID = ?";
      values.push(filters.student_id);
    }
    if (filters.lesson_id) {
      query += " AND e.LESSON_ID = ?";
      values.push(filters.lesson_id);
    }

    const [result] = await connection.query(query, values);
    return { success: true, status: 200, data: result };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function getEnrollmentByID(tenantID, enrollmentID) {
  const connection = await db.getConnection();
  try {
    if (!tenantID || !enrollmentID) errorHandle("BAD_REQUEST", 400);
    const [result] = await connection.query("SELECT * FROM ENROLLMENTS WHERE TENANT_ID = ? AND ENROLLMENT_ID = ?", [tenantID, enrollmentID]);
    if (result.length === 0) errorHandle("NOT_FOUND", 404);
    return { success: true, status: 200, data: result[0] };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function patchEnrollment(tenantID, enrollmentID, status) {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    if (tenantID === undefined || enrollmentID === undefined || status === undefined) errorHandle("BAD_REQUEST", 400);
    if (status < 0 || status > 1) errorHandle("BAD_REQUEST", 400);

    const [result] = await connection.query(
      "UPDATE ENROLLMENTS SET STATUS = ? WHERE TENANT_ID = ? AND ENROLLMENT_ID = ?",
      [status, tenantID, enrollmentID]
    );

    if (result.affectedRows === 0) errorHandle("NOT_FOUND", 404);

    await connection.commit();
    return { success: true, status: 200 };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteEnrollment(tenantID, enrollmentID) {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    if (!tenantID || !enrollmentID) errorHandle("BAD_REQUEST", 400);

    const [result] = await connection.query(
      "DELETE FROM ENROLLMENTS WHERE TENANT_ID = ? AND ENROLLMENT_ID = ?",
      [tenantID, enrollmentID]
    );

    if (result.affectedRows === 0) errorHandle("NOT_FOUND", 404);

    await connection.commit();
    return { success: true, status: 204 };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getEnrollmentsByLessonID(tenantID, lessonID) {
  const connection = await db.getConnection();
  try {
    if (!tenantID || !lessonID) errorHandle("BAD_REQUEST", 400);

    const [result] = await connection.query(
      "SELECT * FROM ENROLLMENTS WHERE TENANT_ID = ? AND LESSON_ID = ?",
      [tenantID, lessonID]
    );
    return { success: true, status: 200, data: result };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createEnrollments,
  getEnrollments,
  getEnrollmentByID,
  patchEnrollment,
  deleteEnrollment,
  getEnrollmentsByLessonID,
};