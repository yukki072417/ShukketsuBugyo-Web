const db = require("../models/db")();
const { errorHandle } = require("../services/errorHandle");

async function createAttendances(tenantID, attendances) {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const query = `INSERT INTO ATTENDANCE (TENANT_ID, ENROLLMENT_ID, STUDENT_ID, DATE, PERIOD, STATUS, NOTES) VALUES ?`;
    const values = [];
    const processedLessons = new Set();
    const attendanceStudents = new Set();

    const lessonInfo = new Map();
    for (const att of attendances) {
      const { enrollment_id, student_id, date, period, status, notes } = att;
      if (
        !enrollment_id ||
        !student_id ||
        !date ||
        !period ||
        status === undefined
      ) {
        throw errorHandle("BAD_REQUEST", 400);
      }
      const formattedDate = new Date(date).toISOString().split("T")[0];
      values.push([
        tenantID,
        enrollment_id,
        student_id,
        formattedDate,
        period,
        status,
        notes || null,
      ]);

      const [enrollmentInfo] = await connection.query(
        `SELECT LESSON_ID FROM ENROLLMENTS WHERE ENROLLMENT_ID = ? AND TENANT_ID = ?`,
        [enrollment_id, tenantID]
      );
      
      if (enrollmentInfo.length > 0) {
        const lessonID = enrollmentInfo[0].LESSON_ID;
        const lessonKey = `${lessonID}-${formattedDate}-${period}`;
        lessonInfo.set(lessonKey, { lessonID, formattedDate, period });
        attendanceStudents.add(student_id);
      }
    }

    for (const [lessonKey, info] of lessonInfo) {
      if (!processedLessons.has(lessonKey)) {
        const { lessonID, formattedDate, period } = info;
        
        const [existingRecords] = await connection.query(
          `SELECT COUNT(*) as count FROM ATTENDANCE A 
           JOIN ENROLLMENTS E ON A.ENROLLMENT_ID = E.ENROLLMENT_ID 
           WHERE A.TENANT_ID = ? AND E.LESSON_ID = ? AND A.DATE = ? AND A.PERIOD = ?`,
          [tenantID, lessonID, formattedDate, period]
        );
        
        if (existingRecords[0].count === 0) {
          const [allEnrollments] = await connection.query(
            `SELECT ENROLLMENT_ID, STUDENT_ID FROM ENROLLMENTS WHERE TENANT_ID = ? AND LESSON_ID = ?`,
            [tenantID, lessonID]
          );
          
          for (const enrollment of allEnrollments) {
            if (!attendanceStudents.has(enrollment.STUDENT_ID)) {
              values.push([
                tenantID,
                enrollment.ENROLLMENT_ID,
                enrollment.STUDENT_ID,
                formattedDate,
                period,
                0, // Status 0 = 欠席
                null
              ]);
            }
          }
        }
        processedLessons.add(lessonKey);
      }
    }

    const enrollmentIds = attendances.map((a) => a.enrollment_id);
    if (enrollmentIds.length > 0) {
      const placeholders = enrollmentIds.map(() => "?").join(",");
      const [enrollments] = await connection.query(
        `SELECT ENROLLMENT_ID, STUDENT_ID FROM ENROLLMENTS WHERE TENANT_ID = ? AND ENROLLMENT_ID IN (${placeholders})`,
        [tenantID, ...enrollmentIds]
      );

      const enrollmentMap = new Map(
        enrollments.map((e) => [e.ENROLLMENT_ID, e.STUDENT_ID])
      );

      for (const att of attendances) {
        if (!enrollmentMap.has(att.enrollment_id)) {
          throw errorHandle(`ENROLLMENT_NOT_FOUND: ${att.enrollment_id}`, 404);
        }
        if (enrollmentMap.get(att.enrollment_id) !== att.student_id) {
          throw errorHandle(
            `ENROLLMENT_STUDENT_MISMATCH: ${att.enrollment_id}`,
            400
          );
        }
      }
    }

    if (values.length > 0) {
      await connection.query(query, [values]);
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getAttendanceByLesson(tenantID, lessonID, statistics) {
  const connection = await db.getConnection();
  try {
    if (statistics) {
      const lessonCountQuery = `
        SELECT COUNT(DISTINCT CONCAT(DATE, '-', PERIOD)) as lesson_count
        FROM ATTENDANCE A
        JOIN ENROLLMENTS E ON A.ENROLLMENT_ID = E.ENROLLMENT_ID
        WHERE A.TENANT_ID = ? AND E.LESSON_ID = ?
      `;

      const studentStatsQuery = `
        SELECT 
          E.STUDENT_ID,
          COUNT(CASE WHEN A.STATUS != 2 THEN 1 END) as attendance_count,
          (SELECT COUNT(DISTINCT CONCAT(DATE, '-', PERIOD)) 
           FROM ATTENDANCE A2 
           JOIN ENROLLMENTS E2 ON A2.ENROLLMENT_ID = E2.ENROLLMENT_ID 
           WHERE A2.TENANT_ID = ? AND E2.LESSON_ID = ?) as total_lessons
        FROM ENROLLMENTS E
        LEFT JOIN ATTENDANCE A ON E.ENROLLMENT_ID = A.ENROLLMENT_ID
        WHERE E.TENANT_ID = ? AND E.LESSON_ID = ?
        GROUP BY E.STUDENT_ID
      `;

      const [lessonCountResult] = await connection.query(lessonCountQuery, [
        tenantID,
        lessonID,
      ]);
      let [studentStats] = await connection.query(studentStatsQuery, [
        tenantID,
        lessonID,
        tenantID,
        lessonID,
      ]);

      const totalLessons = lessonCountResult[0]?.lesson_count || 0;
      const processedStats = studentStats.map((student) => ({
        student_id: student.STUDENT_ID,
        attendance_count: student.attendance_count,
        total_lessons: totalLessons,
        attendance_rate:
          totalLessons > 0
            ? Math.round(
                (student.attendance_count / totalLessons) * 100 * 100
              ) / 100
            : 0,
      }));

      const averageAttendanceRate =
        processedStats.length > 0
          ? processedStats.reduce(
              (sum, student) => sum + student.attendance_rate,
              0
            ) / processedStats.length
          : 0;

      return {
        lesson_count: totalLessons,
        student_statistics: processedStats,
        average_attendance_rate: Math.round(averageAttendanceRate * 100) / 100,
      };
    } else {
      const attendanceQuery = `
        SELECT A.DATE, A.PERIOD, A.STUDENT_ID, A.STATUS, A.NOTES
        FROM ATTENDANCE A
        JOIN ENROLLMENTS E ON A.ENROLLMENT_ID = E.ENROLLMENT_ID
        WHERE A.TENANT_ID = ? AND E.LESSON_ID = ?
        ORDER BY A.DATE, A.PERIOD
      `;

      const [attendanceData] = await connection.query(attendanceQuery, [
        tenantID,
        lessonID,
      ]);

      const processedData = attendanceData.map(record => ({
        date: record.DATE,
        period: record.PERIOD,
        student_id: record.STUDENT_ID,
        status: record.STATUS,
        notes: record.NOTES
      }));

      return {
        attendance_data: processedData,
      };
    }
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function getAttendanceInDate(tenantID, lessonID, date, period) {
  const connection = await db.getConnection();

  try {
    const query = `
      SELECT A.*
      FROM ATTENDANCE A
      JOIN ENROLLMENTS E ON A.ENROLLMENT_ID = E.ENROLLMENT_ID
      WHERE A.TENANT_ID = ? AND E.LESSON_ID = ? AND A.DATE = ? AND A.PERIOD = ?
    `;
    const formattedDate = new Date(date).toISOString().split("T")[0];
    const values = [tenantID, lessonID, formattedDate, period];
    const [result] = await connection.query(query, values);

    return result;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function patchAttendances(tenantID, attendances) {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const query = `UPDATE ATTENDANCE SET STATUS = ?, NOTES = ? WHERE TENANT_ID = ? AND ENROLLMENT_ID = ? AND DATE = ? AND PERIOD = ?`;

    for (const att of attendances) {
      const { enrollment_id, status, notes, date, period } = att;
      if (enrollment_id === undefined || status === undefined) {
        throw errorHandle("BAD_REQUEST", 400);
      }
      const formattedDate = new Date(date).toISOString().split("T")[0];
      await connection.query(query, [
        status,
        notes || null,
        tenantID,
        enrollment_id,
        formattedDate,
        period,
      ]);
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteAttendance(tenantID, enrollmentID, date, period) {
  const connection = await db.getConnection();
  try {
    const query = `
      DELETE FROM ATTENDANCE
      WHERE TENANT_ID = ? AND ENROLLMENT_ID = ? AND DATE = ? AND PERIOD = ?
    `;
    const formattedDate = new Date(date).toISOString().split("T")[0];
    const values = [tenantID, enrollmentID, formattedDate, period];
    const [result] = await connection.query(query, values);

    if (result.affectedRows > 0) {
      return { success: true };
    } else {
      throw errorHandle("SERVER_ERROR", 500);
    }
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function getAttendanceByStudentLesson(tenantID, studentID, lessonID, dateRange) {
  const connection = await db.getConnection();
  try {
    let dateCondition = '';
    let queryParams = [tenantID, studentID, lessonID];
    
    if (dateRange && dateRange !== 'all') {
      // Assuming dateRange format: "2025-01-01,2025-01-31" or single date "2025-01-15"
      if (dateRange.includes(',')) {
        const [startDate, endDate] = dateRange.split(',');
        dateCondition = 'AND A.DATE BETWEEN ? AND ?';
        queryParams.push(startDate, endDate);
      } else {
        dateCondition = 'AND A.DATE = ?';
        queryParams.push(dateRange);
      }
    }

    const query = `
      SELECT A.DATE, A.PERIOD, A.STATUS, A.NOTES
      FROM ATTENDANCE A
      JOIN ENROLLMENTS E ON A.ENROLLMENT_ID = E.ENROLLMENT_ID
      WHERE A.TENANT_ID = ? AND A.STUDENT_ID = ? AND E.LESSON_ID = ?
      ${dateCondition}
      ORDER BY A.DATE, A.PERIOD
    `;

    const [result] = await connection.query(query, queryParams);
    const processedResult = result.map(record => ({
      date: record.DATE,
      period: record.PERIOD,
      status: record.STATUS,
      notes: record.NOTES
    }));
    return processedResult;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createAttendances,
  getAttendanceInDate,
  getAttendanceByLesson,
  getAttendanceByStudentLesson,
  patchAttendances,
  deleteAttendance,
};
